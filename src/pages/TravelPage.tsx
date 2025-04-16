import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Car,
  Plane,
  Train,
  Bus,
  Hotel,
  Search,
  CalendarIcon,
  ArrowRightLeft,
  Globe,
  ChevronDown,
} from "lucide-react";
import AuthForm from "@/components/auth/AuthForm";

const TravelPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authFormType, setAuthFormType] = useState<"login" | "register">(
    "login",
  );
  const [fromLocation, setFromLocation] = useState("Jakarta (CGK)");
  const [toLocation, setToLocation] = useState("Bali / Denpasar (DPS)");
  const [departureDate, setDepartureDate] = useState<Date>(new Date());
  const [returnDate, setReturnDate] = useState<Date | undefined>(new Date());
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const [passengers, setPassengers] = useState("1 Adult, 0 child, 0 infant");
  const [travelClass, setTravelClass] = useState("Economy");

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    checkAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleAuthStateChange = (state: boolean) => {
    setIsAuthenticated(state);
    if (state) {
      setShowAuthForm(false);
    }
  };

  const handleSearch = () => {
    if (!isAuthenticated) {
      setShowAuthForm(true);
      return;
    }

    // In a real app, this would navigate to search results
    alert("Search functionality will be implemented in the future.");
  };

  const swapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const handleTravelOptionClick = (option: string) => {
    // Handle navigation based on the selected travel option
    switch (option) {
      case "Hotels":
        navigate("/hotels");
        break;
      case "Flights":
        navigate("/flights");
        break;
      case "Trains":
        navigate("/trains");
        break;
      case "Bus & Travel":
        navigate("/bus-travel");
        break;
      case "Airport Transfer":
        navigate("/airport-transfer");
        break;
      case "Car Rental":
        window.location.href =
          "https://amazing-cannon2-qguam.view-3.tempo-dev.app/tempobook/storyboards/3c6c1dd7-3070-4035-84c7-76ebf4558bf1?storyboard=true&type=COMPONENT&framework=VITE";
        break;
      case "Things to Do":
        navigate("/things-to-do");
        break;
      case "More":
        navigate("/more");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-600">
      {/* Header */}
      <header className="bg-green-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-green-800"
              onClick={() => navigate(-1)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              <span className="ml-1">Back</span>
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold">Travelintrips</span>
              <span className="text-xs">★</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span>🇮🇩</span>
              <span>EN</span>
              <span>|</span>
              <span>IDR</span>
              <ChevronDown className="h-4 w-4" />
            </div>

            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-green-800"
            >
              Deals
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-green-800"
                >
                  Support <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="grid gap-2">
                  <Button variant="ghost" size="sm" className="justify-start">
                    Help Center
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start">
                    Contact Us
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-green-800"
            >
              Partnership
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-green-800"
            >
              For Corporates
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-green-800"
            >
              Bookings
            </Button>

            {isAuthenticated ? (
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-green-800"
                onClick={() => supabase.auth.signOut()}
              >
                Log Out
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-transparent text-white border-white hover:bg-green-800"
                  onClick={() => {
                    setShowAuthForm(true);
                    setAuthFormType("login");
                  }}
                >
                  Log In
                </Button>
                <Button
                  size="sm"
                  className="bg-green-500 text-white hover:bg-green-600"
                  onClick={() => {
                    setShowAuthForm(true);
                    setAuthFormType("register");
                  }}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-green-900 text-white py-2 border-t border-green-700">
        <div className="container mx-auto flex space-x-6 overflow-x-auto">
          <Button
            variant="ghost"
            className="text-white hover:bg-green-800 cursor-pointer"
            onClick={() => handleTravelOptionClick("Hotels")}
          >
            <Hotel className="h-4 w-4 mr-2" /> Hotels
          </Button>
          <Button
            variant="ghost"
            className="text-white hover:bg-green-800 cursor-pointer"
            onClick={() => handleTravelOptionClick("Flights")}
          >
            <Plane className="h-4 w-4 mr-2" /> Flights
          </Button>
          <Button
            variant="ghost"
            className="text-white hover:bg-green-800 cursor-pointer"
            onClick={() => handleTravelOptionClick("Trains")}
          >
            <Train className="h-4 w-4 mr-2" /> Trains
          </Button>
          <Button
            variant="ghost"
            className="text-white hover:bg-green-800 cursor-pointer"
            onClick={() => handleTravelOptionClick("Bus & Travel")}
          >
            <Bus className="h-4 w-4 mr-2" /> Bus & Travel
          </Button>
          <Button
            variant="ghost"
            className="text-white hover:bg-green-800 cursor-pointer"
            onClick={() => handleTravelOptionClick("Airport Transfer")}
          >
            Airport Transfer
          </Button>
          <Button
            variant="ghost"
            className="text-white hover:bg-green-800 cursor-pointer"
            onClick={() => handleTravelOptionClick("Car Rental")}
          >
            <Car className="h-4 w-4 mr-2" /> Car Rental
          </Button>
          <Button
            variant="ghost"
            className="text-white hover:bg-green-800 cursor-pointer"
            onClick={() => handleTravelOptionClick("Things to Do")}
          >
            Things to Do
          </Button>
          <Button
            variant="ghost"
            className="text-white hover:bg-green-800 cursor-pointer"
            onClick={() => handleTravelOptionClick("More")}
          >
            More <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 text-white">
        <h1 className="text-3xl font-bold text-center mb-8">
          From Southeast Asia to the World, All Yours.
        </h1>

        {/* Travel Options */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          {/* Tabs */}
          <div className="flex mb-6 space-x-4 overflow-x-auto">
            <Button
              variant="ghost"
              className="bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer"
              onClick={() => handleTravelOptionClick("Hotels")}
            >
              <Hotel className="h-4 w-4 mr-2" /> Hotels
            </Button>
            <Button
              variant="ghost"
              className="bg-green-500 text-white hover:bg-green-600 cursor-pointer"
              onClick={() => handleTravelOptionClick("Flights")}
            >
              <Plane className="h-4 w-4 mr-2" /> Flights
            </Button>
            <Button
              variant="ghost"
              className="text-gray-600 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleTravelOptionClick("Trains")}
            >
              <Train className="h-4 w-4 mr-2" /> Trains
            </Button>
            <Button
              variant="ghost"
              className="text-gray-600 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleTravelOptionClick("Bus & Travel")}
            >
              <Bus className="h-4 w-4 mr-2" /> Bus & Travel
            </Button>
            <Button
              variant="ghost"
              className="text-gray-600 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleTravelOptionClick("Airport Transfer")}
            >
              Airport Transfer
            </Button>
            <Button
              variant="ghost"
              className="text-gray-600 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleTravelOptionClick("Car Rental")}
            >
              <Car className="h-4 w-4 mr-2" /> Car Rental
            </Button>
            <Button
              variant="ghost"
              className="text-gray-600 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleTravelOptionClick("Things to Do")}
            >
              Things to Do
            </Button>
            <Button
              variant="ghost"
              className="text-gray-600 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleTravelOptionClick("More")}
            >
              More
            </Button>
          </div>

          {/* Trip Type */}
          <div className="flex mb-6 space-x-2">
            <Button
              variant={isRoundTrip ? "default" : "outline"}
              className="rounded-full text-sm"
              onClick={() => setIsRoundTrip(true)}
            >
              Round-trip
            </Button>
            <Button
              variant={!isRoundTrip ? "default" : "outline"}
              className="rounded-full text-sm"
              onClick={() => setIsRoundTrip(false)}
            >
              One-way
            </Button>
            <Button variant="outline" className="rounded-full text-sm">
              Multi-city
            </Button>
          </div>

          {/* Search Form */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <label className="block text-sm text-gray-600 mb-1">From</label>
              <Input
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className="pl-10 py-6"
              />
              <Plane className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
            </div>

            <div className="relative">
              <label className="block text-sm text-gray-600 mb-1">To</label>
              <Input
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className="pl-10 py-6"
              />
              <Plane className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
            </div>

            <Button
              variant="outline"
              size="icon"
              className="absolute left-1/2 top-32 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full border-2 border-gray-200 z-10"
              onClick={swapLocations}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Departure date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal py-6",
                      !departureDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {departureDate ? (
                      format(departureDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={departureDate}
                    onSelect={(date) => setDepartureDate(date as Date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {isRoundTrip && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Return date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal py-6",
                        !returnDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {returnDate ? (
                        format(returnDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={returnDate}
                      onSelect={(date) => setReturnDate(date as Date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Passengers
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal py-6"
                  >
                    <span>{passengers}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Passengers</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Adults</span>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            -
                          </Button>
                          <span>1</span>
                          <Button size="sm" variant="outline">
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Children</span>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            -
                          </Button>
                          <span>0</span>
                          <Button size="sm" variant="outline">
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Infants</span>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            -
                          </Button>
                          <span>0</span>
                          <Button size="sm" variant="outline">
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full">Apply</Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Class</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal py-6"
                  >
                    <span>{travelClass}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Select Class</h4>
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setTravelClass("Economy")}
                      >
                        Economy
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setTravelClass("Premium Economy")}
                      >
                        Premium Economy
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setTravelClass("Business")}
                      >
                        Business
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setTravelClass("First Class")}
                      >
                        First Class
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6"
              onClick={handleSearch}
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Trusted By Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-200 mb-2">Trusted by</p>
          <div className="flex justify-center space-x-6">
            <div className="bg-white p-2 rounded-md">
              <span className="text-yellow-500 font-bold">ETIHAD</span>
            </div>
            <div className="bg-white p-2 rounded-md">
              <span className="text-green-500 font-bold">LUFTHANSA</span>
            </div>
            <div className="bg-white p-2 rounded-md">
              <span className="text-red-500 font-bold">GARUDA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Promotions Section */}
      <div className="container mx-auto px-4 py-8 bg-white rounded-t-3xl">
        <div className="flex items-center mb-4">
          <div className="text-green-600 mr-2">🎁</div>
          <h2 className="text-lg font-bold text-green-900">
            8% New User Coupons
          </h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Valid for First Transaction on Travelintrips App
        </p>

        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <Badge className="bg-green-100 text-green-800 mb-2">
                  Diskon 8% Hotel
                </Badge>
                <p className="text-xs text-gray-500">min. transaksi Rp 500rb</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-green-500 border-green-500"
              >
                Copy
              </Button>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-xs font-bold">JALANYUK</span>
            </div>
          </Card>

          <Card className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <Badge className="bg-red-100 text-red-800 mb-2">
                  Diskon s.d 8% Xperience
                </Badge>
                <p className="text-xs text-gray-500">min. transaksi Rp 300rb</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-green-500 border-green-500"
              >
                Copy
              </Button>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-xs font-bold">JALANYUK</span>
            </div>
          </Card>

          <Card className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <Badge className="bg-green-100 text-green-800 mb-2">
                  Diskon 12% Antar Jemput Bandara
                </Badge>
                <p className="text-xs text-gray-500">min. transaksi Rp 150rb</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-green-500 border-green-500"
              >
                Copy
              </Button>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-xs font-bold">JALANYUK</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Auth Form Modal */}
      {showAuthForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {authFormType === "login" ? "Log In" : "Register"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAuthForm(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </Button>
            </div>
            <AuthForm
              onAuthStateChange={handleAuthStateChange}
              initialTab={authFormType}
              onClose={() => setShowAuthForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelPage;
