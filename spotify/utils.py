import os
from django.utils import timezone
from datetime import timedelta
from requests import Request, post, put, get

from .models import SpotifyToken

REDIRECT_URI = os.environ.get('REDIRECT_URI')
CLIENT_ID = os.environ.get('CLIENT_ID')
CLIENT_SECRET = os.environ.get('CLIENT_SECRET')
BASE_SPOTIFY_URL = "https://api.spotify.com/v1/me/"

# "https://api.spotify.com/v1/me/player/currently-playing"
EXPIRES_IN = 3600

def get_user_token(session_id):
    user_token = SpotifyToken.objects.filter(user=session_id)

    if user_token.exists():
        return user_token[0]
    return None

def create_or_update_user_token(session_id, access_token, token_type, expires_in, refresh_token, *args, **kwargs):
    token = get_user_token(session_id)
    _expires_in = timezone.now() + timedelta(seconds=expires_in)

    if token:
        token.access_token = access_token
        token.refresh_token = refresh_token
        token.token_type = token_type
        token.expires_in = _expires_in
        token.save(update_fields=["access_token", "token_type", "expires_in", "refresh_token"])
    else:
        token = SpotifyToken(
            user=session_id,
            access_token=access_token,
            refresh_token=refresh_token,
            token_type=token_type,
            expires_in=_expires_in,
        )
        token.save()

def is_spotify_authenticated(session_id, *args, **kwargs):
    token = get_user_token(session_id)

    if token:
        expiry = token.expires_in
        if expiry <= timezone.now():
            refresh_spotify_token(token)
        return True
    return False

def refresh_spotify_token(token):
    refresh_token = token.refresh_token

    response = post(
        "https://accounts.spotify.com/api/token",
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        }
    ).json()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    refresh_token = response.get("refresh_token") or refresh_token
    expires_in = response.get("expires_in")
    session_id = token.user

    create_or_update_user_token(
        session_id=session_id,
        access_token=access_token,
        token_type=token_type,
        expires_in=expires_in,
        refresh_token=refresh_token,
    )

def execute_spotify_api_request(session_id, endpoint, post_=False, put_=False):
    tokens = get_user_token(session_id)

    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now():
            refresh_spotify_token(tokens)

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {tokens.access_token}"
    }

    if post_:
        response = post(BASE_SPOTIFY_URL + endpoint, headers=headers)
        if response.status_code != 200:
            print(f"error when processing endpoint: {endpoint}", response.json())
            return {"error": response.json().get("error")}
    elif put_:
        response = put(BASE_SPOTIFY_URL + endpoint, headers=headers)
        if response.status_code != 200:
            print(f"error when processing endpoint: {endpoint}", response.json())
            return {"error": response.json().get("error")}
    
    response = get(BASE_SPOTIFY_URL + endpoint,headers=headers)

    try:
        if response.status_code == 204:
            return {"error": "No data to display"}
        elif response.status_code == 200:
            return response.json()
    except Exception as ex:
        return {"error": f"Issue with request {ex}"}

def pause_song(session_id):
    endpoint = "player/pause"
    response = execute_spotify_api_request(session_id, endpoint, put_=True)
    return response

def play_song(session_id):
    endpoint = "player/play"
    response = execute_spotify_api_request(session_id, endpoint, put_=True)
    return response