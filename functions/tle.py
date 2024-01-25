from firebase_admin import firestore

# Source: celestrak
# caches: local dir, firestore

def download_tle_data():
    # URL for TLE data
    url = 'https://www.celestrak.com/NORAD/elements/stations.txt'

    # Download the data
#    response = requests.get(url)

#    if response.status_code == 200:
#        tle_data = response.text
#        # Process and store the data
#        print(f"Downloaded {len(tle_data)}")
    with open('.data/NORAD.txt', mode='r') as file:
        lines = [line.rstrip() for line in file]

    process_and_store_tle_data(lines)
#    else:
#        print(f"Failed to download TLE data {response.status_code}")


def process_and_store_tle_data(lines):
    # Split the data into individual TLEs
    for i in range(0,len(lines),3):
        satellite_name = lines[i].strip()
        line1 = lines[i+1].strip()
        line2 = lines[i+2].strip()
        id = line2.split()[1]

        # Write to Firestore
        db = firestore.client()
        doc_ref = db.collection('satellites').document(id)
        doc_ref.set({
            'name': satellite_name,
            'line1': line1,
            'line2': line2
        })

        print(doc_ref)