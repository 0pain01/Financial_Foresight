import { useEffect, useMemo, useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const { user, getUserInitials } = useAuth();
  const { profile: settingsProfile, updateProfile, saveSettings } = useSettings();

  const fullNameFromAuth = useMemo(() => {
    const firstName = user?.firstName?.trim();
    const lastName = user?.lastName?.trim();
    if (firstName || lastName) {
      return [firstName, lastName].filter(Boolean).join(" ");
    }
    return user?.username || "User";
  }, [user]);

  const emailFromAuth = user?.email || "";

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    joinDate: "",
    bio: "",
  });

  useEffect(() => {
    setProfile({
      name: settingsProfile.fullName || fullNameFromAuth,
      email: settingsProfile.email || emailFromAuth,
      phone: settingsProfile.phone || "",
      location: "",
      joinDate: "",
      bio: "",
    });
  }, [settingsProfile, fullNameFromAuth, emailFromAuth]);

  const { toast } = useToast();

  const handleSave = () => {
    updateProfile({
      fullName: profile.name,
      email: profile.email,
      phone: profile.phone,
    });
    saveSettings();
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated",
    });
  };

  const handleCancel = () => {
    setProfile({
      name: settingsProfile.fullName || fullNameFromAuth,
      email: settingsProfile.email || emailFromAuth,
      phone: settingsProfile.phone || "",
      location: "",
      joinDate: "",
      bio: "",
    });
    setIsEditing(false);
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
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
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
                      <AvatarFallback className="text-lg">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-semibold">{profile.name}</h2>
                      <p className="text-muted-foreground">{profile.email || `${user?.username || "user"}@example.com`}</p>
                      <Badge variant="secondary" className="mt-1">
                        Premium Member
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /> : <p className="text-foreground font-medium">{profile.name || "-"}</p>}
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      {isEditing ? <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /> : <p className="text-foreground font-medium">{profile.email || "-"}</p>}
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      {isEditing ? <Input id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /> : <p className="text-foreground font-medium">{profile.phone || "-"}</p>}
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      {isEditing ? <Input id="location" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} /> : <p className="text-foreground font-medium">{profile.location || "-"}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    {isEditing ? (
                      <textarea
                        id="bio"
                        className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md"
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      />
                    ) : (
                      <p className="text-foreground font-medium">{profile.bio || "-"}</p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex gap-3">
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

            <Card>
              <CardHeader>
                <CardTitle>Account Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Member since</span>
                  <span className="ml-auto font-medium">{profile.joinDate || "-"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email verified</span>
                  <Badge variant="secondary" className="ml-auto">Yes</Badge>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Phone</span>
                  <span className="ml-auto font-medium">{profile.phone || "-"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location</span>
                  <span className="ml-auto font-medium">{profile.location || "-"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
