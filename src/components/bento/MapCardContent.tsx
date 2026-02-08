import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

interface MapCardContentProps {
  location?: string;
  onLocationChange?: (location: string) => void;
  isEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
}

interface GeoResult {
  lat: number;
  lon: number;
  display_name: string;
}

// Geocoding using Nominatim (OpenStreetMap) - free, no API key needed
async function geocodeLocation(query: string): Promise<GeoResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      { headers: { 'User-Agent': 'ReBento/1.0' } }
    );
    const data = await response.json();
    if (data && data[0]) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name,
      };
    }
  } catch (e) {
    console.error('Geocoding failed:', e);
  }
  return null;
}

export function MapCardContent({
  location = '',
  onLocationChange,
  isEditing: externalIsEditing,
  onEditingChange,
}: MapCardContentProps) {
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(location);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [displayName, setDisplayName] = useState(location);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = externalIsEditing ?? internalIsEditing;
  const setIsEditing = (value: boolean) => {
    setInternalIsEditing(value);
    onEditingChange?.(value);
  };

  // Geocode on mount if we have a location but no coords
  useEffect(() => {
    if (location && !coords) {
      geocodeLocation(location).then((result) => {
        if (result) {
          setCoords({ lat: result.lat, lon: result.lon });
          setDisplayName(result.display_name.split(',').slice(0, 2).join(','));
        }
      });
    }
  }, []);

  const handleSubmit = async () => {
    if (!inputValue.trim()) {
      setError('Please enter a location');
      return;
    }

    setError(null);
    setIsLoading(true);

    const result = await geocodeLocation(inputValue);
    setIsLoading(false);

    if (result) {
      setCoords({ lat: result.lat, lon: result.lon });
      setDisplayName(result.display_name.split(',').slice(0, 2).join(','));
      onLocationChange?.(inputValue);
      setIsEditing(false);
    } else {
      setError('Location not found. Try a more specific address.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(location);
      setError(null);
    }
  };

  const hasLocation = location && location.trim().length > 0 && coords;

  // Edit mode
  if (isEditing) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800/50 p-4">
        <div className="w-full max-w-xs">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter location
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder="e.g. Ponda, Goa, India"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && (
            <p className="mt-2 text-xs text-red-500">{error}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Try: city name, address, or landmark
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !inputValue.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setInputValue(location);
                setError(null);
              }}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!hasLocation) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="flex flex-col items-center justify-center h-full w-full gap-2 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 hover:from-blue-100 hover:to-green-100 dark:hover:from-blue-900/30 dark:hover:to-green-900/30 transition-colors"
      >
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
          <MapPin className="w-6 h-6 text-blue-500" />
        </div>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Add location</span>
      </button>
    );
  }

  // Map view using OpenStreetMap embed
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.01},${coords.lat - 0.01},${coords.lon + 0.01},${coords.lat + 0.01}&layer=mapnik&marker=${coords.lat},${coords.lon}`;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* OpenStreetMap Embed */}
      <iframe
        src={mapEmbedUrl}
        className="absolute inset-0 w-full h-full border-0"
        style={{ pointerEvents: 'none' }}
        title={`Map of ${displayName}`}
      />

      {/* Location label */}
      <button
        onClick={() => setIsEditing(true)}
        className="absolute bottom-3 left-3 right-3 z-10"
      >
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {displayName}
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}
