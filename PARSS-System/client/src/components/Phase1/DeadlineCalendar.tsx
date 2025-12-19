import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus
} from 'lucide-react';
import type { ComplianceDeadline } from '@/types/phase1';

interface DeadlineCalendarProps {
  deadlines: ComplianceDeadline[];
  onDateSelect?: (date: Date) => void;
  onDeadlineClick?: (deadline: ComplianceDeadline) => void;
  onCreateDeadline?: (date: Date) => void;
  className?: string;
}

const DeadlineCalendar: React.FC<DeadlineCalendarProps> = ({
  deadlines,
  onDateSelect,
  onDeadlineClick,
  onCreateDeadline,
  className
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get calendar data for current month
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from Sunday before the first day of the month
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // End on Saturday after the last day of the month
    const endDate = new Date(lastDay);
    const daysToAdd = 6 - lastDay.getDay();
    endDate.setDate(endDate.getDate() + daysToAdd);
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  // Group deadlines by date
  const deadlinesByDate = useMemo(() => {
    const grouped: Record<string, ComplianceDeadline[]> = {};
    
    deadlines.forEach(deadline => {
      const dateKey = new Date(deadline.dueDate).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(deadline);
    });
    
    return grouped;
  }, [deadlines]);

  // Get deadlines for a specific date
  const getDeadlinesForDate = (date: Date) => {
    const dateKey = date.toDateString();
    return deadlinesByDate[dateKey] || [];
  };

  // Check if a date is in the current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if a date is selected
  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  // Get deadline status color
  const getDeadlineColor = (deadline: ComplianceDeadline) => {
    const daysRemaining = Math.ceil((new Date(deadline.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (deadline.status === 'completed') return 'bg-green-100 text-green-800 border-green-200';
    if (deadline.status === 'overdue' || daysRemaining < 0) return 'bg-red-100 text-red-800 border-red-200';
    if (daysRemaining <= 7) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (daysRemaining <= 30) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  // Handle deadline click
  const handleDeadlineClick = (deadline: ComplianceDeadline, event: React.MouseEvent) => {
    event.stopPropagation();
    onDeadlineClick?.(deadline);
  };

  // Handle create deadline click
  const handleCreateDeadline = (date: Date, event: React.MouseEvent) => {
    event.stopPropagation();
    onCreateDeadline?.(date);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Deadline Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-lg min-w-[120px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarData.map((date, index) => {
            const dayDeadlines = getDeadlinesForDate(date);
            const hasDeadlines = dayDeadlines.length > 0;
            
            return (
              <div
                key={index}
                className={`
                  relative min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors
                  ${isCurrentMonth(date) ? 'bg-white' : 'bg-gray-50'}
                  ${isSelected(date) ? 'ring-2 ring-blue-500' : ''}
                  ${isToday(date) ? 'ring-2 ring-green-500' : ''}
                  ${hasDeadlines ? 'hover:bg-gray-50' : 'hover:bg-gray-50'}
                `}
                onClick={() => handleDateClick(date)}
              >
                {/* Date number */}
                <div className="flex items-center justify-between mb-1">
                  <span className={`
                    text-sm font-medium
                    ${!isCurrentMonth(date) ? 'text-gray-400' : 'text-gray-900'}
                    ${isToday(date) ? 'bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs' : ''}
                  `}>
                    {date.getDate()}
                  </span>
                  
                  {/* Add deadline button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 hover:opacity-100 hover:bg-blue-100"
                    onClick={(e) => handleCreateDeadline(date, e)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                {/* Deadlines */}
                <div className="space-y-1">
                  {dayDeadlines.slice(0, 3).map((deadline, deadlineIndex) => (
                    <div
                      key={deadline.id}
                      className={`
                        text-xs p-1 rounded border cursor-pointer transition-colors
                        ${getDeadlineColor(deadline)}
                      `}
                      onClick={(e) => handleDeadlineClick(deadline, e)}
                      title={`${deadline.title} - ${deadline.priority} priority`}
                    >
                      <div className="flex items-center gap-1">
                        {deadline.priority === 'critical' && <AlertTriangle className="h-3 w-3" />}
                        {deadline.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                        <span className="truncate">{deadline.title}</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* More deadlines indicator */}
                  {dayDeadlines.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayDeadlines.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
              <span>Critical/Overdue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
              <span>Due Soon (≤7 days)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
              <span>Upcoming (≤30 days)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
              <span>Completed</span>
            </div>
          </div>
        </div>
        
        {/* Selected Date Details */}
        {selectedDate && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Deadlines for {selectedDate.toLocaleDateString()}
            </h4>
            {(() => {
              const selectedDateDeadlines = getDeadlinesForDate(selectedDate);
              if (selectedDateDeadlines.length === 0) {
                return (
                  <div className="text-sm text-gray-500 text-center py-4">
                    No deadlines scheduled for this date
                  </div>
                );
              }
              
              return (
                <div className="space-y-2">
                  {selectedDateDeadlines.map((deadline) => (
                    <div
                      key={deadline.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => onDeadlineClick?.(deadline)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-2 h-2 rounded-full
                          ${deadline.status === 'completed' ? 'bg-green-500' : 
                            deadline.status === 'overdue' ? 'bg-red-500' : 'bg-blue-500'}
                        `} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
                          <p className="text-xs text-gray-500">{deadline.councilType} • {deadline.regulationType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={getPriorityColor(deadline.priority)}>
                          {deadline.priority}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.ceil((new Date(deadline.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeadlineCalendar;