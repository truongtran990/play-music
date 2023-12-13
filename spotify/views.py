from django.shortcuts import render, redirect
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from requests import Request, post

from .utils import create_or_update_user_token, is_spotify_authenticated

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
