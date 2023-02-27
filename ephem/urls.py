"""ephem URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from satellites import views
from rest_framework import routers

urlpatterns = [
    path('', views.home, name="satellites"),
    path('settings', views.settings, name="settings"),
    path('predictions', views.predictions, name="predictions"),
    path('detail/<int:id>', views.detail, name="detail"),
    path('pass/<int:id>', views.pass_timeline, name="pass"),
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('api/satellites', views.get_satellites, name="satellites"),
    path('api/satellites/<int:id>/passes', views.get_passes, name="passes"),
    path('api/satellites/<int:id>/passes/<int:start>-<int:end>', views.get_pass_details, name="pass"),
    path('api/satellites/predictions', views.get_predictions, name="predictions"),
]
