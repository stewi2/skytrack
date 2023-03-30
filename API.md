** API Routes

GET /api/groups

GET /api/satellites

GET /api/satellites/<id>/passes?lat=<latitude>&lon=<longitude>&visible_only=<true|false>

GET /api/satellites/<id>/passes/<start>-<end>?lat=<latitude>&lon=<longitude>

GET /api/satellites/predictions?group=<group>&duration=<duration>&start=<timestamp>&lat=<latitude>&lon=<longitude>&visible_only=<true|false>

** Browser Routes

GET /

GET /predictions

GET /settings

GET /detail/<satid>

GET /pass/900/<start>-<end>