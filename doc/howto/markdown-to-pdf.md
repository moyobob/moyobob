# 마크다운 문서를 pdf로 변환하기

[pandoc](https://pandoc.org/)으로 pdf를 생성하고,
[ghostscript](https://www.ghostscript.com/)로 압축한다.

## 문서의 정보 달기

마크다운 문서 상단에 다음과 같은 정보를 입력할 수 있다:

```markdown
---
title: Title
author: Author
papersize: a4
mainfont: SomeFont
fontsize: 12pt
...
---

...
```

어떤 정보를 적을 수 있는지는 [pandoc 문서](https://pandoc.org/MANUAL.html#templates)를 참고하자.

## pdf 만들기

```bash
pandoc input.md -o output.pdf
```

만약 문서에 한글이 포함되어 있다면, 한글이 포함된 폰트를 설정하고, 다음과 같이 만들어야 한다:

```bash
pandoc input.md -o output.pdf --pdf-engine=xelatex
```

## 문서 압축하기

[Reference](https://gist.github.com/firstdoit/6390547)

```bash
ghostscript -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/printer -dNOPAUSE -dQUIET -dBATCH -sOutputFile=output.pdf input.pdf
```
