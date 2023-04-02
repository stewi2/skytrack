from django.contrib import admin
from django.urls import path, include
from satellites import views
from django.conf import settings
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns = [
    path('api-auth/', include('rest_framework.urls')),
    path('api/groups', views.get_groups, name="groups"),
    path('api/satellites', views.get_satellites, name="satellites"),
    path('api/satellites/<int:id>/passes', views.get_passes, name="passes"),
    path('api/satellites/<int:id>/passes/<int:start>-<int:end>', views.get_pass_details, name="pass"),
    path('api/satellites/predictions', views.get_predictions, name="predictions"),
]

if settings.ADMIN_ENABLED is True:
    urlpatterns += [path('admin/', admin.site.urls),]
