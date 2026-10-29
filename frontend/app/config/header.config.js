const HeaderConfig = {
  roles: {
    'project-officer': {
      title: "projectOfficer",
      profileImg: "/images/projectOfficer.jpg",
      officerName: "Khalid Umar",
      logout: { name: "LogOut", url: "/roles/project-officer/logout", icon: "➜" },
      role: "Project Officer",
      state: "Delhi",
      district: "Ujwa",
    },
    'LandAcqOfficer': {
      title: "LandAcqOfficer",
      profileImg: "/images/LAOfficer.jpg",
      officerName: "Ali Arzan Zaidi",
      logout: { name: "LogOut", url: "/roles/LandAcqOfficer/logout", icon: "➜" },
      role: "Land Acquisition Officer",
      state: "Delhi",
      district: "Ujwa",
    },
    'nodal-officer': {
      title: "Project Officer",
      profileImg: "/images/nodal-officer.jpg",
      officerName: "Sahil Alvi",
      logout: { name: "LogOut", url: "/roles/nodal-officer/logout", icon: "➜" },
      role: "Nodal Officer",
      state: "Delhi",
      district: "Ujwa",
    },
    'admin': {
      title: "Admin",
      profileImg: "/images/admin.jpg",
      officerName: "Mohd Fahad",
      logout: { name: "LogOut", url: "/roles/admin/logout", icon: "➜" },
      role: "Admin",
      state: "Delhi",
      district: "Ujwa",
    },
     'super-admin': {
      title: "Super Admin",
      logout: { name: "LogOut", url: "/roles/admin/logout", icon: "➜" },
      role: "Super Admin",
      state: "National Level",
      district: "Administrative Office",
    },
  },
};

export default HeaderConfig;