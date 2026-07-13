import { Button, IconButton, Menu } from '@yourssu-inhouse/interior';
import { MdDelete, MdEdit, MdMoreVert, MdShare } from 'react-icons/md';

const Section = ({
  label,
  side = 'bottom',
  behavior = 'click',
}: {
  behavior?: 'click' | 'hover';
  label: string;
  side?: 'bottom' | 'left' | 'right' | 'top';
}) => (
  <div className="flex flex-col gap-4">
    <h3 className="text-15 text-greyOpacity900 font-semibold">{label}</h3>
    <div>
      <Menu behavior={behavior}>
        <Menu.Trigger asChild>
          <IconButton size="md" variant="dimmed">
            <MdMoreVert />
          </IconButton>
        </Menu.Trigger>
        <Menu.Content align="start" side={side}>
          <div className="w-[180px]">
            <Menu.ButtonItem icon={<MdEdit />}>수정</Menu.ButtonItem>
            <Menu.ButtonItem icon={<MdShare />}>공유</Menu.ButtonItem>
            <Menu.ButtonItem icon={<MdDelete />}>삭제</Menu.ButtonItem>
          </div>
        </Menu.Content>
      </Menu>
    </div>
  </div>
);

export const MenuView = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">기본 (click, side=bottom)</h3>
        <div className="flex items-center gap-4">
          <Menu>
            <Menu.Trigger asChild>
              <Button size="lg" variant="secondary">
                메뉴 열기
              </Button>
            </Menu.Trigger>
            <Menu.Content align="start" side="bottom">
              <div className="w-[180px]">
                <Menu.ButtonItem icon={<MdEdit />}>수정</Menu.ButtonItem>
                <Menu.ButtonItem icon={<MdShare />}>공유</Menu.ButtonItem>
                <Menu.ButtonItem icon={<MdDelete />}>삭제</Menu.ButtonItem>
              </div>
            </Menu.Content>
          </Menu>
          <Menu>
            <Menu.Trigger asChild>
              <IconButton size="lg" variant="dimmed">
                <MdMoreVert />
              </IconButton>
            </Menu.Trigger>
            <Menu.Content align="end">
              <div className="w-[180px]">
                <Menu.ButtonItem icon={<MdEdit />}>수정</Menu.ButtonItem>
                <Menu.ButtonItem icon={<MdShare />}>공유</Menu.ButtonItem>
                <Menu.ButtonItem icon={<MdDelete />}>삭제</Menu.ButtonItem>
              </div>
            </Menu.Content>
          </Menu>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">아이콘 없는 ButtonItem</h3>
        <div>
          <Menu>
            <Menu.Trigger asChild>
              <Button size="lg" variant="secondary">
                메뉴 열기
              </Button>
            </Menu.Trigger>
            <Menu.Content align="start" side="bottom">
              <div className="w-[160px]">
                <Menu.ButtonItem>복사</Menu.ButtonItem>
                <Menu.ButtonItem>이동</Menu.ButtonItem>
                <Menu.ButtonItem>삭제</Menu.ButtonItem>
              </div>
            </Menu.Content>
          </Menu>
        </div>
      </div>

      <div className="flex flex-wrap gap-12">
        <Section label="side=top" side="top" />
        <Section label="side=right" side="right" />
        <Section label="side=left" side="left" />
      </div>

      <div className="flex flex-wrap gap-12">
        <Section behavior="hover" label="behavior=hover" />
      </div>
    </div>
  );
};
