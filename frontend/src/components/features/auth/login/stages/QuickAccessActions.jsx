import { ClipboardList, MessageCircle } from 'lucide-react';

export const QuickAccessActions = ({
  ActionsComponent,
  ButtonComponent,
  onOpenBoardPage,
  onOpenLiveChatPage,
}) => {
  const Actions = ActionsComponent;
  const Button = ButtonComponent;

  return (
    <Actions aria-label="빠른 이동">
      <Button
        type="button"
        onClick={onOpenBoardPage}
        aria-label="게시판 열기"
        title="게시판"
      >
        <ClipboardList size={24} strokeWidth={1.9} aria-hidden="true" />
      </Button>
      <Button
        type="button"
        onClick={onOpenLiveChatPage}
        aria-label="채팅 열기"
        title="채팅"
      >
        <MessageCircle size={24} strokeWidth={1.9} aria-hidden="true" />
      </Button>
    </Actions>
  );
};
