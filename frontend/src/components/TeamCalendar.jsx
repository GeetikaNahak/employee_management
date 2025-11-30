import { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function TeamCalendar({ viewMode }) {
  const [teamData, setTeamData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const year = currentMonth.getFullYear();
      const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
      const res = await axios.get(`/attendance/team-calendar?year=${year}&month=${month}`);
      setTeamData(res.data);
    } catch (error) {
      console.error('Failed to load team calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'calendar') {
      loadTeamData();
    }
  }, [currentMonth, viewMode]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-500';
      case 'absent': return 'bg-red-500';
      case 'late': return 'bg-yellow-500';
      case 'half-day': return 'bg-orange-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'present': return 'text-green-600';
      case 'absent': return 'text-red-600';
      case 'late': return 'text-yellow-600';
      case 'half-day': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 border border-gray-200"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(year, month, day);
      const dayData = teamData.filter(record => record.date === dateStr);
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <div
          key={day}
          className={`h-12 border ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} p-1 overflow-hidden`}
        >
          <div className="text-xs font-medium mb-1">{day}</div>
          <div className="flex gap-1 flex-wrap">
            {dayData.slice(0, 3).map((record, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${getStatusColor(record.status)}`}
                title={`${record.userId.name} - ${record.status}`}
              ></div>
            ))}
            {dayData.length > 3 && (
              <div className="text-xs text-gray-500">+{dayData.length - 3}</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  // Group data by employee
  const employeesData = teamData.reduce((employees, record) => {
    if (!employees[record.userId._id]) {
      employees[record.userId._id] = {
        user: record.userId,
        attendance: []
      };
    }
    employees[record.userId._id].attendance.push(record);
    return employees;
  }, {});

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold">{monthYear}</h2>
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-8 gap-2 mb-4">
          <div className="text-sm font-medium text-gray-600">Employee</div>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Employee Rows */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {Object.values(employeesData).map(({ user, attendance }) => (
            <div key={user._id} className="grid grid-cols-8 gap-2 items-center">
              <div className="text-sm font-medium truncate" title={user.name}>
                {user.name}
              </div>
              {Array.from({ length: 7 }, (_, i) => {
                const day = i + 1;
                const dateStr = formatDate(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const dayRecord = attendance.find(r => r.date === dateStr);
                
                return (
                  <div key={day} className="h-8 border border-gray-200 rounded flex items-center justify-center">
                    {dayRecord && (
                      <div
                        className={`w-4 h-4 rounded-full ${getStatusColor(dayRecord.status)}`}
                        title={`${dayRecord.status}`}
                      ></div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Late</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Half Day</span>
          </div>
        </div>
      </div>
    </div>
  );
}
