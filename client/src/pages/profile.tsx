import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Calendar, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    joinDate: "January 2024",
    bio: "Personal finance enthusiast focused on building wealth and achieving financial independence."
  });

  const { toast } = useToast();

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated"
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form here if needed
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Topbar />
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
                      <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/api/placeholder/150/150" alt="Profile" />
                      <AvatarFallback className="text-lg">JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-semibold">{profile.name}</h2>
                      <p className="text-muted-foreground">{profile.email}</p>
                      <Badge variant="secondary" className="mt-1">
                        Premium Member
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => setProfile({...profile, name: e.target.value})}
                        />
                      ) : (
                        <p className="text-foreground font-medium">{profile.name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({...profile, email: e.target.value})}
                        />
                      ) : (
                        <p className="text-foreground font-medium">{profile.email}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        />
                      ) : (
                        <p className="text-foreground font-medium">{profile.phone}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      {isEditing ? (
                        <Input
                          id="location"
                          value={profile.location}
                          onChange={(e) => setProfile({...profile, location: e.target.value})}
                        />
                      ) : (
                        <p className="text-foreground font-medium">{profile.location}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    {isEditing ? (
                      <textarea
                        id="bio"
                        className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md"
                        value={profile.bio}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      />
                    ) : (
                      <p className="text-foreground">{profile.bio}</p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex space-x-4">
                      <Button onClick={handleSave} className="bg-finance-blue hover:bg-blue-700">
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Member since</span>
                      </div>
                      <span className="text-sm font-medium">{profile.joinDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Account type</span>
                      </div>
                      <Badge variant="secondary">Premium</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Location</span>
                      </div>
                      <span className="text-sm font-medium">{profile.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="mr-2 h-4 w-4" />
                      Change Email
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="mr-2 h-4 w-4" />
                      Update Phone
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Edit2 className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}