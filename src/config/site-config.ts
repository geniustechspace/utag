export const internalUrls = {
    home: "/",
    auth: "/accounts/auth",
    signin: "/accounts/auth/signin",
    signup: "/accounts/auth/signup",
    forgotPassword: "/accounts/auth/forgot-password",
    settings: "/accounts/settings",

    qna: "/qna",
    meetings: "/meetings",
    documents: "/documents",
    promotions: "/promotions",
    newPromotion: "/promotions/new",
    notifications: "/notifications",
    constitution: "/constitution",
};

export const userRoles = [
    "Member",
    "Secretary",
    "President",
    "Treasurer",
    "Vice President",
    "Electoral Commissioner",
];

/* eslint-disable prettier/prettier */
export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: "UTAG",
    description:
        "Make beautiful websites regardless of your design experience.",
    navItems: [
        {
            label: "Home",
            href: "/",
        },
        {
            label: "Blog",
            href: "/blog",
        },
        {
            label: "About",
            href: "/about",
        },
    ],
    navMenuItems: [
        {
            label: "Overview",
            href: internalUrls.home,
        },
        {
            label: "Questions & Discussions",
            href: internalUrls.qna,
        },
        {
            label: "Meetings",
            href: internalUrls.meetings,
        },
        {
            label: "Documents",
            href: internalUrls.documents,
        },
        {
            label: "Promotions",
            href: internalUrls.promotions,
        },
        {
            label: "Notifications",
            href: internalUrls.notifications,
        },
        {
            label: "Constitution",
            href: internalUrls.constitution,
        },
    ],
    links: {
        github: "https://github.com/nextui-org/nextui",
        twitter: "https://twitter.com/getnextui",
        docs: "https://nextui.org",
        discord: "https://discord.gg/9b6yyZKmH4",
        sponsor: "https://patreon.com/jrgarciadev",
    },
};
