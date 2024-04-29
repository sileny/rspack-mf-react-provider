interface Props {
  origin?: string;
}

export const Hello = ({ origin }: Props) => {
  return <div>from <b>{origin}</b></div>;
};
