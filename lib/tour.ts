// The first-run tour: Fitbot walks a new customer through the main screens. Fixed Hebrew texts (no AI call), plural address.

export type TourStep = {
  id: string;
  /** the tab the step belongs to; the tour opens it before showing the step */
  route: string;
  /** value of the data-tour attribute of the element to highlight; none = Fitbot talks in the middle of the screen */
  target?: string;
  title: string;
  body: string;
};

/** What the customer has, so that steps about things they do not have are left out. */
export type TourContext = { fitbotTab: boolean; paces: boolean };

export function tourSteps({ fitbotTab, paces }: TourContext): TourStep[] {
  const steps: (TourStep | false)[] = [
    {
      id: "welcome",
      route: "/home",
      title: "היי, אני Fitbot 👋",
      body: "אני העוזר שלכם ב־FitFam. אעבור איתכם על הדברים החשובים באפליקציה, זה לוקח פחות מדקה. אפשר לדלג בכל רגע.",
    },
    {
      id: "home",
      route: "/home",
      target: "home-stats",
      title: "הנקודות והרצף שלכם",
      body: "כל אימון שמסיימים מזכה בנקודות ומעלה את הרמה שלכם. שלושה אימונים בשבוע שומרים על הרצף השבועי.",
    },
    {
      id: "roadmap",
      route: "/roadmap",
      target: "tab/roadmap",
      title: "המסלול",
      body: "זו המפה של התוכנית. כל עצירה היא אימון, ועושים אותם לפי הסדר שהמאמנים קבעו. לוחצים על האימון הבא כדי לפתוח אותו.",
    },
    {
      id: "challenge",
      route: "/roadmap",
      title: "אתגר מעבר רמה",
      body: "בסוף כל רמה מחכה כוכב גדול: אתגר. עברתם אותו? עוברים לרמה הבאה. מי שכבר מתקדם יכול לנסות את האתגר מראש ולדלג קדימה. לא הצלחתם? מנסים שוב, בלי הגבלה.",
    },
    {
      id: "workout",
      route: "/roadmap",
      title: "דף האימון",
      body: "בתוך כל אימון רואים את כל התוכנית: התרגילים, הסטים והמנוחות, סרטון הסבר כשיש, וקופסה מיוחדת עם יעד המאמץ, כמה חזרות להשאיר לפני הכשל.",
    },
    {
      id: "player",
      route: "/roadmap",
      title: "נגן האימון, אם בא לכם",
      body: "אפשר ללכת סט אחרי סט עם טיימר מנוחה וצלילים, או פשוט לקרוא את האימון ולסמן שסיימתם. מה שנוח לכם.",
    },
    {
      id: "log",
      route: "/roadmap",
      title: "יומן משקל וחזרות",
      body: "בכל תרגיל אפשר לרשום משקל וחזרות. זה לגמרי אופציונלי. תראו מה עשיתם בפעם הקודמת, ו״כמו קודם״ ממלא את זה בלחיצה אחת.",
    },
    fitbotTab && {
      id: "fitbot",
      route: "/fitbot",
      target: "tab/fitbot",
      title: "זה אני",
      body: "אפשר לשאול אותי על אימון, על תרגיל או על תזונה כללית. אחרי כל אימון אשאל איך היה. אני בינה מלאכותית, לא מחליף רופא או מאמן.",
    },
    paces && {
      id: "paces",
      route: "/profile",
      target: "pace",
      title: "קצבי ריצה אישיים",
      body: "הזינו תוצאה אחרונה ב־5 ק״מ ואחשב לכם קצב לכל אימון ריצה. אם משהו מרגיש לא נכון, אפשר לשנות את הטווחים בעצמכם.",
    },
    {
      id: "profile",
      route: "/profile",
      target: "tab/profile",
      title: "הפרופיל וההגדרות",
      body: "כאן הצלילים, הנתונים שלכם, והסיור הזה, שאפשר להפעיל שוב בכל זמן.",
    },
    {
      id: "done",
      route: "/roadmap",
      title: "זהו, אתם מוכנים!",
      body: "האימון הראשון כבר מחכה לכם במסלול. בהצלחה, אני פה אם צריך משהו.",
    },
  ];
  return steps.filter((s): s is TourStep => s !== false);
}
