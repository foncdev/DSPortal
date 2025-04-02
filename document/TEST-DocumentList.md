// Demo/src/components/DocumentList.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DocumentList } from './DocumentList';
import type { Document } from '@ds/core';

describe('DocumentList 컴포넌트', () => {
// 테스트 문서 데이터
const documents: Document[] = [
{
id: '1',
title: '테스트 문서 1',
content: '테스트 내용 1',
createdBy: 'user1',
createdAt: new Date(2023, 0, 1),
updatedAt: new Date(2023, 0, 1),
status: 'published',
tags: ['태그1', '태그2']
},
{
id: '2',
title: '테스트 문서 2',
content: '테스트 내용 2',
createdBy: 'user1',
createdAt: new Date(2023, 0, 2),
updatedAt: new Date(2023, 0, 2),
status: 'draft',
tags: ['태그3']
}
];

it('문서 목록을 렌더링해야 함', () => {
const { getByText } = render(
<DocumentList
documents={documents}
selectedId={null}
onSelect={() => {}}
/>
);

    expect(getByText('테스트 문서 1')).toBeInTheDocument();
    expect(getByText('테스트 문서 2')).toBeInTheDocument();
});

it('문서가 없을 때 메시지를 표시해야 함', () => {
const { getByText } = render(
<DocumentList
documents={[]}
selectedId={null}
onSelect={() => {}}
/>
);

    expect(getByText('문서가 없습니다.')).toBeInTheDocument();
});

it('선택된 문서를 강조 표시해야 함', () => {
const { container } = render(
<DocumentList
documents={documents}
selectedId="1"
onSelect={() => {}}
/>
);

    const selectedItem = container.querySelector('.document-item.selected');
    expect(selectedItem).not.toBeNull();
    expect(selectedItem?.textContent).toContain('테스트 문서 1');
});

it('문서 상태에 따라 다른 아이콘을 표시해야 함', () => {
const { container } = render(
<DocumentList
documents={documents}
selectedId={null}
onSelect={() => {}}
/>
);

    const publishedIcon = container.querySelector('[data-status="published"]');
    const draftIcon = container.querySelector('[data-status="draft"]');
    
    expect(publishedIcon).not.toBeNull();
    expect(draftIcon).not.toBeNull();
});

it('UI 스냅샷과 일치해야 함', () => {
const { container } = render(
<DocumentList
documents={documents}
selectedId={null}
onSelect={() => {}}
/>
);

    expect(container).toMatchSnapshot();
});

it('선택된 문서가 있는 UI 스냅샷과 일치해야 함', () => {
const { container } = render(
<DocumentList
documents={documents}
selectedId="2"
onSelect={() => {}}
/>
);

    expect(container).toMatchSnapshot();
});
});

// Demo/src/components/DocumentViewer.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DocumentViewer } from './DocumentViewer';
import type { Document } from '@ds/core';

describe('DocumentViewer 컴포넌트', () => {
const document: Document = {
id: '1',
title: '테스트 문서 제목',
content: '# 마크다운 내용\n\n이것은 테스트 문서 내용입니다.\n\n- 항목 1\n- 항목 2',
createdBy: 'user1',
createdAt: new Date(2023, 0, 1),
updatedAt: new Date(2023, 0, 10),
status: 'published',
tags: ['테스트', '마크다운']
};

it('문서가 없을 때 안내 메시지를 표시해야 함', () => {
const { getByText } = render(<DocumentViewer document={null} />);

    expect(getByText('문서를 선택하세요.')).toBeInTheDocument();
});

it('문서 제목과 내용을 렌더링해야 함', () => {
const { getByText, getByRole } = render(<DocumentViewer document={document} />);

    expect(getByRole('heading')).toHaveTextContent('테스트 문서 제목');
    expect(getByText('이것은 테스트 문서 내용입니다.')).toBeInTheDocument();
});

it('마크다운 내용을 HTML로 렌더링해야 함', () => {
const { container } = render(<DocumentViewer document={document} />);

    const heading = container.querySelector('h1');
    const listItems = container.querySelectorAll('li');
    
    expect(heading).toHaveTextContent('마크다운 내용');
    expect(listItems.length).toBe(2);
    expect(listItems[0]).toHaveTextContent('항목 1');
    expect(listItems[1]).toHaveTextContent('항목 2');
});

it('문서의 메타 정보를 표시해야 함', () => {
const { getByText } = render(<DocumentViewer document={document} />);

    expect(getByText(/마지막 수정: 2023년 1월 10일/)).toBeInTheDocument();
    expect(getByText(/#테스트/)).toBeInTheDocument();
    expect(getByText(/#마크다운/)).toBeInTheDocument();
});

it('문서가 있을 때 UI 스냅샷과 일치해야 함', () => {
const { container } = render(<DocumentViewer document={document} />);
expect(container).toMatchSnapshot();
});

it('문서가 없을 때 UI 스냅샷과 일치해야 함', () => {
const { container } = render(<DocumentViewer document={null} />);
expect(container).toMatchSnapshot();
});
});