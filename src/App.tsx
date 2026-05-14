/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Thermometer, Gauge, Droplets, Flame, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SensorData {
  time: string;
  temperature: number;
  methane: number;
  pressure: number;
  usage: number;
}

export default function App() {
  const [data, setData] = useState<SensorData[]>([    {      time: "0:0:0",      temperature: 450,
      methane: 15,
      pressure: 2.1,
      usage: 85,
    }
  ]);
  const [currentData, setCurrentData] = useState<SensorData>({
    time: "0:0:0",
    temperature: 450,
    methane: 15,
    pressure: 2.1,
    usage: 85,
  });
  const [alert, setAlert] = useState<string | null>(null);
  const [visibleLines, setVisibleLines] = useState({ methane: true, temperature: true });

  const exportCSV = () => {
    const headers = ["Time", "Temperature", "Methane", "Pressure", "Usage"];
    const rows = data.map(item => [item.time, item.temperature, item.methane, item.pressure, item.usage]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pyrolysis_data.csv';
    a.click();
  };

  useEffect(() => {
    const updateData = () => {
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      
      // Simulate sensor variance
      const newData = {
        time: timeStr,
        temperature: Math.round(450 + Math.random() * 100),
        methane: Math.round(15 + Math.random() * 30),
        pressure: parseFloat((2.0 + Math.random()).toFixed(1)),
        usage: Math.round(80 + Math.random() * 10),
      };

      setCurrentData(newData);
      setData((prev) => [...prev.slice(-19), newData]);

      // Simple alert logic
      if (newData.methane > 35) {
        setAlert("WARNING: High Methane Levels Detected!");
      } else if (newData.temperature > 520) {
        setAlert("WARNING: High Temperature Detected!");
      } else {
        setAlert(null);
      }
    };

    updateData(); // Call immediately
    const interval = setInterval(updateData, 3000); // 3 seconds interval

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFAF0] p-6 text-[#000000]">
      <header className="mb-8 flex items-center justify-between border-b border-[#9AD872] pb-6">
        <h1 className="text-3xl font-bold tracking-tighter">Pylis Dashboard</h1>
        <div className={`px-4 py-2 rounded-full border ${alert ? 'bg-red-200 border-red-500' : 'bg-[#9AD872] border-green-700'}`}>
          {alert ? <span className="flex items-center gap-2 text-red-900"><AlertTriangle size={16}/> System Alert!</span> : 'System Normal'}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
         {alert && (
            <div className="lg:col-span-1 rounded-xl bg-red-100 border-2 border-red-500 p-6 flex flex-col justify-center shadow-md text-red-900 font-bold">
               <AlertTriangle className="mb-2" size={32}/>
               {alert}
            </div>
         )}
         
         <div className={`${alert ? 'lg:col-span-4' : 'lg:col-span-5'} grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4`}>
            {[
              { label: 'Temperature', value: `${currentData.temperature}°C`, icon: Thermometer, color: 'text-[#9AD872]' },
              { label: 'Methane Level', value: `${currentData.methane}%`, icon: Droplets, color: 'text-[#9AD872]' },
              { label: 'Gas Pressure', value: `${currentData.pressure} bar`, icon: Gauge, color: 'text-[#9AD872]' },
              { label: 'Gas Usage', value: `${currentData.usage} m³/h`, icon: Flame, color: 'text-[#9AD872]' },
            ].map((item, idx) => (
              <div key={idx} className="rounded-xl bg-white p-6 shadow-sm border border-[#9AD872]">
                <div className="mb-2 flex items-center justify-between text-[#000000]">
                  <span className="text-sm font-medium">{item.label}</span>
                  <item.icon className={item.color} size={20} />
                </div>
                <div className="text-2xl font-bold">{item.value}</div>
              </div>
            ))}
         </div>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm border border-[#9AD872]">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Real-Time Historical Data</h2>
            <div className="flex gap-4">
                <button
                    onClick={() => setVisibleLines(prev => ({ ...prev, methane: !prev.methane }))}
                    className={`px-3 py-1 rounded ${visibleLines.methane ? 'bg-[#9AD872] text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Toggle Methane
                </button>
                <button
                    onClick={() => setVisibleLines(prev => ({ ...prev, temperature: !prev.temperature }))}
                    className={`px-3 py-1 rounded ${visibleLines.temperature ? 'bg-[#333333] text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Toggle Temp
                </button>
                <button 
                    onClick={exportCSV}
                    className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-900"
                >
                    Export CSV
                </button>
            </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#000000" />
              <YAxis stroke="#000000" />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #9AD872' }} itemStyle={{ color: '#000000' }} />
              {visibleLines.methane && <Line type="monotone" dataKey="methane" stroke="#9AD872" strokeWidth={3} name="Methane(%)" />}
              {visibleLines.temperature && <Line type="monotone" dataKey="temperature" stroke="#333333" strokeWidth={2} name="Temp(°C)" />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
