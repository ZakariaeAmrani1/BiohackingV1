import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock appointment data
const mockAppointments = [
  {
    id: 1,
    time: "09:00",
    duration: 60,
    patient: "John Smith",
    treatment: "Biohacking Consultation",
    status: "confirmed",
    date: new Date(2024, 1, 15),
  },
  {
    id: 2,
    time: "10:30",
    duration: 45,
    patient: "Sarah Johnson",
    treatment: "IV Therapy",
    status: "pending",
    date: new Date(2024, 1, 15),
  },
  {
    id: 3,
    time: "14:00",
    duration: 90,
    patient: "Mike Davis",
    treatment: "Cryotherapy Session",
    status: "confirmed",
    date: new Date(2024, 1, 16),
  },
];

const statusColors = {
  confirmed: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

export default function AppointmentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"week" | "day">("week");

  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const timeSlots = Array.from({ length: 12 }, (_, i) => `${8 + i}:00`);

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentDate(newDate);
  };

  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getAppointmentsForDate = (date: Date) => {
    return mockAppointments.filter(
      (apt) => apt.date.toDateString() === date.toDateString(),
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-xl font-semibold">
            Appointment Calendar
          </CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex rounded-lg border border-border p-1">
              <Button
                variant={view === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("week")}
                className="h-8"
              >
                Week
              </Button>
              <Button
                variant={view === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("day")}
                className="h-8"
              >
                Day
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateWeek("prev")}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[120px] text-center text-sm font-medium">
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateWeek("next")}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="sm"
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {view === "week" ? (
          <div className="grid grid-cols-8 border-t border-border">
            {/* Time column */}
            <div className="border-r border-border">
              <div className="h-12 border-b border-border"></div>
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="h-16 border-b border-border px-2 py-1 text-xs text-muted-foreground"
                >
                  {time}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {getWeekDates().map((date, dayIndex) => (
              <div
                key={dayIndex}
                className="border-r border-border last:border-r-0"
              >
                <div className="h-12 border-b border-border px-2 py-2 text-center">
                  <div className="text-xs font-medium text-muted-foreground">
                    {weekDays[dayIndex]}
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {formatDate(date)}
                  </div>
                </div>
                {timeSlots.map((time, timeIndex) => {
                  const dayAppointments = getAppointmentsForDate(date);
                  const timeAppointments = dayAppointments.filter(
                    (apt) => apt.time === time,
                  );

                  return (
                    <div
                      key={timeIndex}
                      className="h-16 border-b border-border p-1 relative"
                    >
                      {timeAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="absolute inset-x-1 top-1 bottom-1 rounded-md bg-primary/10 border border-primary/20 p-2 text-xs overflow-hidden"
                        >
                          <div className="font-medium text-primary truncate">
                            {appointment.patient}
                          </div>
                          <div className="text-muted-foreground truncate">
                            {appointment.treatment}
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-xs mt-1 ${statusColors[appointment.status as keyof typeof statusColors]}`}
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4">
            <div className="space-y-4">
              {mockAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {appointment.time}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{appointment.patient}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {appointment.treatment}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      statusColors[
                        appointment.status as keyof typeof statusColors
                      ]
                    }
                  >
                    {appointment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
