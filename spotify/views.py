from django.shortcuts import render, redirect
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from requests import Request, post

from .utils import create_or_update_user_token, is_spotify_authenticated, execute_spotify_api_request, pause_song, play_song, skip_song
from music_api.models import Room
from .models import Vote

REDIRECT_URI = os.environ.get('REDIRECT_URI')
CLIENT_ID = os.environ.get('CLIENT_ID')
CLIENT_SECRET = os.environ.get('CLIENT_SECRET')


class SpotifyAuthView(APIView):
    def get(self, request, format=None, *args, **kwargs):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()        
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
        
        url = Request(
            method='GET',
            url='https://accounts.spotify.com/authorize',
            params={
                'scope': scopes,
                'response_type': 'code',
                'redirect_uri': REDIRECT_URI,
                'client_id': CLIENT_ID,
            }
        ).prepare().url

        response_data = {
            "message": "Ok",
            "url": url,
        }

        print(f"[INFO] - SpotifyAuthView__get: url: {response_data}")
        return Response(data=response_data, status=status.HTTP_200_OK)
    
def spotify_callback(request, *args, **kwargs):
    if not request.session.exists(request.session.session_key):
        request.session.create()

    code = request.GET.get("code")
    error = request.GET.get("error")

    response = post(
        "https://accounts.spotify.com/api/token",
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        }
    ).json()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    refresh_token = response.get("refresh_token")
    expires_in = response.get("expires_in")
    error = response.get("error")
    session_id = request.session.session_key

    create_or_update_user_token(
        session_id=session_id,
        access_token=access_token,
        token_type=token_type,
        expires_in=expires_in,
        refresh_token=refresh_token,
    )

    return redirect("frontend:")

class IsSpotifyAuthenticatedView(APIView):
    def get(self, request, format=None, *args, **kwargs):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)

        response_data = {
            "message": "OK",
            "status": is_authenticated
        }
        print("IsSpotifyAuthenticatedView: ", response_data)
        return Response(data=response_data, status=status.HTTP_200_OK)


class GetCurrentSongView(APIView):
    def get(self, request, format=None, *args, **kwargs):
        if not request.session.exists(request.session.session_key):
            request.session.create()

        # get roomCode
        room_code = self.request.session.get("room_code")
        query_object = Room.objects.filter(code=room_code)
        
        if not query_object.exists():
            return Response(data={"error": "You're not in the room"}, status=status.HTTP_400_BAD_REQUEST)

        room = query_object[0]
        host = room.host
        
        endpoint = "player/currently-playing"
        response = execute_spotify_api_request(host, endpoint)

        if not response or "error" in response or "item" not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        item = response.get("item")
        duration = item.get("duration_ms")
        progress = response.get("progress_ms")
        album_cover = item.get("album", {}).get("images", "")
        if album_cover:
            album_cover = album_cover[0].get("url")
        is_playing = response.get("is_playing")
        song_id = item.get("id")
        artist_string = ""

        for i, artist in enumerate(item.get('artists')):
            if i > 0:
                artist_string += ", "
            name = artist.get("name")
            artist_string += name

        votes = len(Vote.objects.filter(room=room, song_id=song_id))
        song = {
            "title": item.get("name"),
            "artist": artist_string,
            "duration": duration,
            "time": progress,
            "image_url": album_cover,
            "is_playing": is_playing,
            "votes": votes,
            "needed_votes_to_skip": room.votes_to_skip,
            "id": song_id
        }

        self.update_room_song(room, song_id)

        return Response(data=song, status=status.HTTP_200_OK)
    
    """whenever you get the current song detail -> you will update the room's current_song with this song"""
    def update_room_song(self, room, song_id):
        current_song = room.current_song

        if current_song != song_id:
            # update the current_song for the room, if the current_song is not the same with song_id was passed
            room.save(update_fields=["current_song"])
            # delete all vote of this room
            votes = Vote.objects.filter(room=room).delete()
    

class PauseSongView(APIView):
    def put(self, request, format=None, *args, **kwargs):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)

        if self.request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
    
        return Response({}, status=status.HTTP_403_FORBIDDEN)


class PlaySongView(APIView):
    def put(self, request, format=None, *args, **kwargs):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)

        if room: 
            room = room[0]

        if self.request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
    
        return Response({}, status=status.HTTP_403_FORBIDDEN)

class SkipSongView(APIView):
    def post(self, request, format=None, *args, **kwargs):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)
        if not room: 
            return Response({}, status=status.HTTP_403_FORBIDDEN)
        room = room[0]
        votes = Vote.objects.filter(room=room, song_id=room.current_song)
        needed_votes_to_skip = room.votes_to_skip


        if self.request.session.session_key == room.host or room.guest_can_pause or len(votes) + 1 >= needed_votes_to_skip:
            votes.delete()
            skip_song(room.host)
        # handle in case you're not the host
        # you will create the vote to skip to this song
        else:
            vote = Vote(user=self.request.session.session_key, room=room, song_id=room.current_song)
            vote.save()
        return Response({}, status=status.HTTP_204_NO_CONTENT)