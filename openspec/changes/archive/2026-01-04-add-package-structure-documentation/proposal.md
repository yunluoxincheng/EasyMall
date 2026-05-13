# Change: 添加项目包结构说明文档

## Why

当前项目缺少对包结构和各模块功能的系统性说明文档。新加入的开发者需要花费大量时间浏览代码才能理解各个包的职责和作用。一份清晰、详细且通俗易懂的包结构说明文档可以帮助开发者快速理解项目架构，提高开发效率。

## What Changes

- 创建 `docs/PACKAGE_STRUCTURE.md` 文档
- 文档包含以下内容：
  - 项目整体架构概览
  - 每个一级包的详细功能说明
  - 关键子包的作用说明
  - 各层（Controller/Service/Mapper）的职责说明
  - 数据流向和调用关系说明
  - 通俗易懂的语言，配合代码示例

## Impact

- Affected specs: 无（新增文档，不影响现有功能规范）
- Affected code: 无（纯文档变更）
- Documentation: 新增 `docs/PACKAGE_STRUCTURE.md`

## Notes

- 这是纯文档变更，不涉及代码修改
- 文档将使用Markdown格式，便于阅读和维护
- 将保持与代码结构同步更新
