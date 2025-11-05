export type Palette = {
  mode: string;
  primary: string;
  secondary: string;
  background: string;
  text: string;
  title?: string;
};
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