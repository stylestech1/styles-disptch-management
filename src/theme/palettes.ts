export type TPaletteConfig = {
  mode?: "light" | "dark";
  primary: {
    main: string;
    contrastText?: string;
  };
  secondary: {
    main: string;
    contrastText?: string;
  };
  background: {
    default?: string;
    paper?: string;
  };
  text: {
    primary?: string;
    secondary?: string;
  };
};