export type Palette = {
  mode: string;
  primary: string;
  secondary: string;
  background: string;
  text: string;
  title?: string;
};
export type TPaletteConfig = {
  _id?: string;
  mode: string;
  primary: {
    main: string;
    contrastText: string;
  };
  secondary: {
    main: string;
    contrastText: string;
  };
  background: {
    default: string;
    paper: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
  createdAt?: string;
  updatedAt?: string;
};
