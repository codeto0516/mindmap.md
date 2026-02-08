interface Props {
  title: string;
}

export const ViewMode = ({ title }: Props) => (
  <span className="truncate w-full whitespace-pre-wrap break-words text-left">
    {title}
  </span>
);
