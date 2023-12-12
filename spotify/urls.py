from django.urls import path

from .views import SpotifyAuthView

urlpatterns = [
    path('get-auth-url', SpotifyAuthView.as_view()),
]



