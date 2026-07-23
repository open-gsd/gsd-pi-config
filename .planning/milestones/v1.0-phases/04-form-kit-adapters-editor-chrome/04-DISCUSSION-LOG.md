# Phase 4 Discussion Log

**Date:** 2026-07-22  
**Phase:** Form Kit Adapters + Editor Chrome  
**Areas discussed:** Adapter strategy, control mapping, domain pickers, editor chrome  
**Not discussed (discretion):** validation polish, gsd bridge end

## FormControls adapter strategy

| Question | Selected |
|----------|----------|
| API shape | Same FormControls.tsx, web presentation inside |
| Desktop forms | Stay legacy gsd chrome |
| Section files | Presentation-only via FormControls |
| Order | Form kit first → editor shell |

## Control mapping

| Question | Selected |
|----------|----------|
| Toggle | shadcn Switch |
| Select | shadcn Select |
| Multi/Combo/Tags | Command/Popover + Checkbox/Input compose |
| Text/Number/Field | Input + linear labeled Field |

## Domain pickers

| Question | Selected |
|----------|----------|
| ModelPicker | Keep UX; Combobox/Command restyle |
| ModelChain | Keep reorder/add/remove; linear rows |
| Location | Stay in FormControls.tsx |
| Empty/loading | Quiet inline |

## Editor shell

| Question | Selected |
|----------|----------|
| Sidebar | Linear list + left-edge active |
| Toolbar | Button language + quiet status |
| Banners | Quiet Alert-style Mist Sky |
| Mobile drawer | Keep behavior; restyle panel |
