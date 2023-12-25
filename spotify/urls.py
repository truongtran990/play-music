from django.urls import path

from .views import SpotifyAuthView, spotify_callback, IsSpotifyAuthenticatedView, GetCurrentSongView

urlpatterns = [
    path('get-auth-url/', SpotifyAuthView.as_view()),
    path('callback/', spotify_callback),
    path('is-authenticated/', IsSpotifyAuthenticatedView.as_view()),
    path('current-song/', GetCurrentSongView.as_view())
]



