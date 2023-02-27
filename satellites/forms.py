from django import forms

class SettingsForm(forms.Form):
 #   template_name = "satellites/form_snippet.html"

    lat = forms.FloatField(label='Latitude', min_value=-90, max_value=90)
    lon = forms.FloatField(label='Longitude', min_value=-180, max_value=180)
    