from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/upload/', views.upload, name='upload'),
    path('api/sounds/', views.list_sounds, name='list_sounds'),
    path('api/sounds/<int:sound_id>/delete/', views.delete_sound, name='delete_sound'),
]
