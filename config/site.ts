export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Application Branch Y99",
  description: "Quản lý chi nhánh của bạn.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Đăng nhập",
      href: "/login",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
