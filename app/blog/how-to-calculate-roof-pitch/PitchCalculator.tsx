'use client';

import { useState } from 'react';

export function PitchCalculator() {
  const [run, setRun] = useState('12');
  const [rise, setRise] = useState('6');
  const [calculatedPitch, setCalculatedPitch] = useState('');
  const [multiplier, setMultiplier] = useState('');

  const calculatePitch = () => {
    const riseNum = parseFloat(rise);
    const runNum = parseFloat(run);

    if (riseNum && runNum) {
      const pitchRatio = `${riseNum}:${runNum}`;
      const angle = Math.atan(riseNum / runNum) * (180 / Math.PI);
      const mult = Math.sqrt(1 + Math.pow(riseNum / runNum, 2));

      setCalculatedPitch(`${pitchRatio} (${angle.toFixed(1)}°)`);
      setMultiplier(mult.toFixed(3));
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 mb-8 border-2 border-blue-300">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Pitch Calculator</h3>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Rise (inches)</label>
          <input
            type="number"
            value={rise}
            onChange={(e) => setRise(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 text-lg"
            placeholder="6"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Run (inches)</label>
          <input
            type="number"
            value={run}
            onChange={(e) => setRun(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 text-lg"
            placeholder="12"
          />
        </div>
      </div>
      <button
        onClick={calculatePitch}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-6"
      >
        Calculate Pitch
      </button>
      {calculatedPitch && (
        <div className="bg-white rounded-lg p-6 border-2 border-blue-500">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Roof Pitch</div>
              <div className="text-2xl font-bold text-blue-600">{calculatedPitch}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Pitch Multiplier</div>
              <div className="text-2xl font-bold text-blue-600">{multiplier}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
