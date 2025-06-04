import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Play, Pause, RefreshCw, TrendingUp, Users, DollarSign, Activity, Globe, Filter, Download } from 'lucide-react';

const RealtimeAnalyticsDashboard = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [dataPoints, setDataPoints] = useState([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 1247832,
    revenue: 89432.50,
    activeConnections: 15647,
    throughput: 2341
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [selectedMetric, setSelectedMetric] = useState('users');
  const streamingRef = useRef(null);
  const chartRef = useRef(null);

  // Generate initial large dataset
  const generateInitialData = () => {
    const data = [];
    const now = Date.now();
    for (let i = 0; i < 1000; i++) {
      data.push({
        timestamp: now - (1000 - i) * 60000,
        users: Math.floor(Math.random() * 1000) + 500,
        revenue: Math.random() * 5000 + 1000,
        connections: Math.floor(Math.random() * 200) + 100,
        throughput: Math.floor(Math.random() * 1000) + 500,
        errors: Math.floor(Math.random() * 10),
        responseTime: Math.random() * 200 + 50
      });
    }
    return data;
  };

  // Initialize data on mount
  useEffect(() => {
    setDataPoints(generateInitialData());
  }, []);

  // Simulate real-time data streaming
  useEffect(() => {
    if (isStreaming) {
      streamingRef.current = setInterval(() => {
        const newPoint = {
          timestamp: Date.now(),
          users: Math.floor(Math.random() * 1000) + 500 + Math.sin(Date.now() / 10000) * 200,
          revenue: Math.random() * 5000 + 1000 + Math.cos(Date.now() / 15000) * 1000,
          connections: Math.floor(Math.random() * 200) + 100 + Math.sin(Date.now() / 8000) * 50,
          throughput: Math.floor(Math.random() * 1000) + 500 + Math.cos(Date.now() / 12000) * 300,
          errors: Math.floor(Math.random() * 10),
          responseTime: Math.random() * 200 + 50 + Math.sin(Date.now() / 5000) * 30
        };

        setDataPoints(prev => {
          const updated = [...prev.slice(-999), newPoint];
          return updated;
        });

        // Update metrics
        setMetrics(prev => ({
          totalUsers: prev.totalUsers + Math.floor(Math.random() * 10) - 5,
          revenue: prev.revenue + Math.random() * 100 - 50,
          activeConnections: newPoint.connections,
          throughput: newPoint.throughput
        }));
      }, 1000);
    } else {
      clearInterval(streamingRef.current);
    }

    return () => clearInterval(streamingRef.current);
  }, [isStreaming]);

  // D3 Custom Heatmap Component
  const HeatmapChart = ({ data }) => {
    const svgRef = useRef();

    useEffect(() => {
      if (!data.length) return;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const margin = { top: 20, right: 20, bottom: 40, left: 60 };
      const width = 400 - margin.left - margin.right;
      const height = 200 - margin.bottom - margin.top;

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Process data for heatmap
      const hours = d3.range(24);
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      const heatmapData = [];
      days.forEach((day, dayIdx) => {
        hours.forEach(hour => {
          heatmapData.push({
            day: dayIdx,
            hour,
            value: Math.random() * 100 + Math.sin(hour / 24 * Math.PI * 2) * 30
          });
        });
      });

      const xScale = d3.scaleBand()
        .domain(hours)
        .range([0, width])
        .padding(0.1);

      const yScale = d3.scaleBand()
        .domain(d3.range(7))
        .range([0, height])
        .padding(0.1);

      const colorScale = d3.scaleSequential(d3.interpolateViridis)
        .domain([0, 130]);

      g.selectAll('.heatmap-rect')
        .data(heatmapData)
        .enter()
        .append('rect')
        .attr('class', 'heatmap-rect')
        .attr('x', d => xScale(d.hour))
        .attr('y', d => yScale(d.day))
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('fill', d => colorScale(d.value))
        .attr('opacity', 0.8);

      // Add axes
      g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickSize(0))
        .selectAll('text')
        .style('font-size', '10px');

      g.append('g')
        .call(d3.axisLeft(yScale).tickFormat(i => days[i]).tickSize(0))
        .selectAll('text')
        .style('font-size', '10px');

    }, [data]);

    return <svg ref={svgRef} width={400} height={240}></svg>;
  };

  // Process data for charts
  const chartData = useMemo(() => {
    if (!dataPoints.length) return [];
    const timeframe = selectedTimeframe === '1h' ? 60 : selectedTimeframe === '6h' ? 360 : 1440;
    return dataPoints.slice(-timeframe).map(point => ({
      ...point,
      time: new Date(point.timestamp).toLocaleTimeString()
    }));
  }, [dataPoints, selectedTimeframe]);

  const pieData = [
    { name: 'Desktop', value: 45, color: '#8b5cf6' },
    { name: 'Mobile', value: 35, color: '#06b6d4' },
    { name: 'Tablet', value: 20, color: '#10b981' }
  ];

  const regionData = [
    { region: 'North America', users: 450000, growth: 12.5 },
    { region: 'Europe', users: 380000, growth: 8.3 },
    { region: 'Asia Pacific', users: 520000, growth: 18.7 },
    { region: 'Latin America', users: 180000, growth: 15.2 },
    { region: 'Africa', users: 95000, growth: 22.1 }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Real-Time Analytics
          </h1>
          <p className="text-gray-400 mt-2">Processing {dataPoints.length.toLocaleString()}+ data points</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
          </select>
          
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isStreaming 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isStreaming ? <Pause size={18} /> : <Play size={18} />}
            {isStreaming ? 'Stop Stream' : 'Start Stream'}
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</p>
              <p className="text-green-400 text-sm flex items-center gap-1 mt-1">
                <TrendingUp size={14} />
                +12.5%
              </p>
            </div>
            <Users className="text-purple-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Revenue</p>
              <p className="text-2xl font-bold">${metrics.revenue.toLocaleString()}</p>
              <p className="text-green-400 text-sm flex items-center gap-1 mt-1">
                <TrendingUp size={14} />
                +8.3%
              </p>
            </div>
            <DollarSign className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Connections</p>
              <p className="text-2xl font-bold">{metrics.activeConnections.toLocaleString()}</p>
              <p className="text-cyan-400 text-sm flex items-center gap-1 mt-1">
                <Activity size={14} />
                Live
              </p>
            </div>
            <Globe className="text-cyan-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Throughput</p>
              <p className="text-2xl font-bold">{metrics.throughput}/s</p>
              <p className="text-orange-400 text-sm flex items-center gap-1 mt-1">
                <RefreshCw size={14} />
                Real-time
              </p>
            </div>
            <Activity className="text-orange-400" size={32} />
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Primary Time Series */}
        <div className="col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">User Activity Timeline</h3>
            <div className="flex gap-2">
              {['users', 'revenue', 'connections'].map(metric => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedMetric === metric
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }} 
              />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Device Distribution */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Device Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm">{entry.name}</span>
                </div>
                <span className="text-sm font-medium">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Response Time Heatmap */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Response Time Heatmap</h3>
          <div className="flex justify-center">
            <HeatmapChart data={chartData} />
          </div>
        </div>

        {/* Regional Performance */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Regional Performance</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={regionData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} />
              <YAxis dataKey="region" type="category" stroke="#9ca3af" fontSize={12} width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="users" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real-time Data Table */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Live Data Stream</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="text-sm text-gray-400">
              {isStreaming ? 'Streaming' : 'Paused'}
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2">Timestamp</th>
                <th className="text-left py-2">Users</th>
                <th className="text-left py-2">Revenue</th>
                <th className="text-left py-2">Connections</th>
                <th className="text-left py-2">Throughput</th>
                <th className="text-left py-2">Errors</th>
                <th className="text-left py-2">Response Time</th>
              </tr>
            </thead>
            <tbody>
              {chartData.slice(-10).reverse().map((row, index) => (
                <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-2">{row.time}</td>
                  <td className="py-2">{row.users.toLocaleString()}</td>
                  <td className="py-2">${row.revenue.toFixed(2)}</td>
                  <td className="py-2">{row.connections}</td>
                  <td className="py-2">{row.throughput}/s</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      row.errors === 0 ? 'bg-green-600' : row.errors < 5 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}>
                      {row.errors}
                    </span>
                  </td>
                  <td className="py-2">{row.responseTime.toFixed(1)}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Footer */}
      <div className="mt-8 flex justify-between items-center text-sm text-gray-400">
        <div>
          Last updated: {new Date().toLocaleTimeString()} | 
          Processing {dataPoints.length.toLocaleString()} data points
        </div>
        <div className="flex items-center gap-4">
          <span>System Status: <span className="text-green-400">Operational</span></span>
          <span>Latency: <span className="text-cyan-400">42ms</span></span>
          <span>Uptime: <span className="text-purple-400">99.97%</span></span>
        </div>
      </div>
    </div>
  );
};

export default RealtimeAnalyticsDashboard;