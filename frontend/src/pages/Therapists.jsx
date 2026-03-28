import { useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { MapPin, Star, ExternalLink, Sliders } from 'lucide-react';

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} className={`h-3.5 w-3.5 ${n <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
      ))}
      <span className="text-gray-600 text-xs ml-1">{rating}</span>
    </div>
  );
}

export default function Therapists() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [radius, setRadius] = useState(10);
  const [locationError, setLocationError] = useState('');

  const findTherapists = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await api.get('/therapists/nearby', {
            params: { lat, lng, radius: radius * 1000 }
          });
          setTherapists(res.data.results || []);
          setSearched(true);
          if ((res.data.results || []).length === 0) {
            toast('No therapists found in this area. Try increasing the radius.', { icon: '🔍' });
          } else {
            toast.success(`Found ${res.data.results.length} therapist${res.data.results.length !== 1 ? 's' : ''} nearby`);
          }
        } catch (err) {
          toast.error('Failed to fetch therapists. Please try again.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setLocationError('Location access denied. Please allow location access and try again.');
        toast.error('Location access denied');
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-wellness-50/30">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Find Therapists Near You</h1>
          <p className="text-gray-500">Discover licensed mental health professionals in your area</p>
        </div>

        {/* Search Controls */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="mb-5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Sliders className="h-4 w-4" /> Search Radius: <span className="text-primary-600 font-semibold">{radius} km</span>
            </label>
            <input
              type="range"
              min={1}
              max={25}
              value={radius}
              onChange={e => setRadius(Number(e.target.value))}
              className="w-full h-2 rounded-full cursor-pointer"
              style={{ accentColor: '#14b8a6' }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 km</span>
              <span>25 km</span>
            </div>
          </div>

          {locationError && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
              {locationError}
            </div>
          )}

          <button
            onClick={findTherapists}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-wellness-500 to-teal-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? (
              <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> Searching...</>
            ) : (
              <><MapPin className="h-5 w-5" /> Find Therapists Near Me</>
            )}
          </button>
          <p className="text-center text-gray-400 text-xs mt-2">
            Requires location permission. Your location is not stored.
          </p>
        </div>

        {/* Results */}
        {!searched && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Discover therapists near you</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              We'll use your location to find verified mental health professionals nearby. Your location is never stored.
            </p>
          </div>
        )}

        {searched && therapists.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 mb-4">No therapists were found within {radius} km of your location.</p>
            <p className="text-gray-400 text-sm">Try increasing the search radius above.</p>
          </div>
        )}

        {therapists.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-4">{therapists.length} result{therapists.length !== 1 ? 's' : ''} within {radius} km</p>
            <div className="grid gap-4">
              {therapists.map(t => (
                <div key={t.place_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{t.name}</h3>
                      {t.rating && (
                        <div className="flex items-center gap-2 mb-2">
                          <StarRating rating={t.rating} />
                          {t.user_ratings_total && (
                            <span className="text-gray-400 text-xs">({t.user_ratings_total} reviews)</span>
                          )}
                        </div>
                      )}
                      {t.address && (
                        <div className="flex items-start gap-1.5 text-gray-600 text-sm mb-2">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-wellness-500" />
                          <span>{t.address}</span>
                        </div>
                      )}
                      {t.opening_hours && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${t.opening_hours.open_now ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                          {t.opening_hours.open_now ? '✓ Open now' : '✗ Closed'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {t.geometry?.location && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${t.geometry.location.lat},${t.geometry.location.lng}&query_place_id=${t.place_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-wellness-50 hover:bg-wellness-100 text-wellness-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> View on Maps
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
