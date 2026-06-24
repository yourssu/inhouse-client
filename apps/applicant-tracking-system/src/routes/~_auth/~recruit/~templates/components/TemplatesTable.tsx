import { useSuspenseQuery } from '@tanstack/react-query';
import { IconButton } from '@yourssu-inhouse/interior';
import { Menu } from '@yourssu-inhouse/interior';
import { Pagination } from '@yourssu-inhouse/interior';
import { Table } from '@yourssu-inhouse/interior';
import { MdMoreHoriz } from 'react-icons/md';

import { mailTemplatesOption } from '@/apis/mails/query';
import { useSearchState } from '@/hooks/useSearchState';
import { useSetStateSelector } from '@/hooks/useSetStateSelector';
import { formatTemplates } from '@/utils/date';

import { TemplateDeleteButton } from './TemplateDeleteButton';
import { TemplateEditButton } from './TemplateEditButton';
import { TemplateUseButton } from './TemplateUseButton';

export const TemplatesTable = () => {
  const [search, setSearch] = useSearchState({ from: '/_auth/recruit/templates/' });
  const setters = {
    page: useSetStateSelector(setSearch, 'page'),
  };

  const { data } = useSuspenseQuery(mailTemplatesOption({ page: search.page - 1, size: 10 }));
  const { content: templates, page, totalPages } = data;

  const sortedTemplates = templates.toSorted((a, b) => b.id - a.id);

  return (
    <>
      <Table className="px-3 pb-4" rowCount={sortedTemplates.length}>
        <Table.Head>
          <Table.Th className="max-w-20">템플릿 ID</Table.Th>
          <Table.Th align="left">템플릿 이름</Table.Th>
          <Table.Th>최근 수정일</Table.Th>
          <Table.Th />
        </Table.Head>
        <Table.Body>
          {sortedTemplates.map((template) => (
            <Table.Row key={template.id}>
              <Table.Cell className="max-w-20">{template.id}</Table.Cell>
              <Table.Cell align="left">{template.title}</Table.Cell>
              <Table.Cell>{formatTemplates['2026. 01. 01 23:00'](template.updatedAt)}</Table.Cell>
              <Table.Cell>
                <Menu>
                  <Menu.Trigger>
                    <IconButton size="sm" variant="dimmed">
                      <MdMoreHoriz className="size-4.5" />
                    </IconButton>
                  </Menu.Trigger>
                  <Menu.Content align="end">
                    <TemplateUseButton templateId={template.id} />
                    <TemplateEditButton templateId={template.id} />
                    <TemplateDeleteButton templateId={template.id} />
                  </Menu.Content>
                </Menu>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <div className="mt-5 flex w-full items-center justify-end">
        <Pagination
          currentPage={page + 1}
          onPageChange={(v) => {
            setters.page(v);
          }}
          totalPages={totalPages}
        />
      </div>
    </>
  );
};
