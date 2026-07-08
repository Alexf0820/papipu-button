# PapipuButton

Project PapipupePopcorn の第一弾作品。**One Button. One World.**

世界中のユーザーが同じ赤いボタンを押し、24桁の世界累計カウンターを増やす Web アプリです。Milestone Card（Bronze / Silver / Gold / World Record）や Save Image などの演出を備えています。

- 本番 URL: https://papipubutton.com

## 技術スタック

- Next.js (App Router)
- Tailwind CSS
- Supabase（世界カウンター）
- Google Analytics 4（任意）

## 環境変数

`.env.local` に設定します。`.env.example` をコピーして利用してください。

| 変数 | 必須 | 説明 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | はい | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | はい | Supabase anon key |
| `NEXT_PUBLIC_GA_ID` | いいえ | GA4 Measurement ID（例: `G-XXXXXXXXXX`）。未設定時は GA を読み込まない |

```bash
cp .env.example .env.local
```

## Supabase SQL

初回セットアップ時、Supabase SQL Editor で以下を実行してください。マイグレーションファイル: [`supabase/migrations/001_button_counter.sql`](supabase/migrations/001_button_counter.sql)

```sql
create table if not exists public.button_counter (
  id integer primary key,
  count bigint not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.button_counter (id, count)
values (1, 0)
on conflict (id) do nothing;

create or replace function public.increment_counter()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count bigint;
begin
  update public.button_counter
  set
    count = count + 1,
    updated_at = now()
  where id = 1
  returning count into new_count;

  if new_count is null then
    raise exception 'button_counter row id=1 not found';
  end if;

  return new_count;
end;
$$;

grant usage on schema public to anon, authenticated;
grant select on table public.button_counter to anon, authenticated;
grant execute on function public.increment_counter() to anon, authenticated;
```

## ローカル起動

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

その他コマンド:

```bash
npm run lint
npm run build
npm run start
```

## デプロイ前確認項目

- [ ] `.env.local` / 本番環境変数に Supabase URL・anon key が設定されている
- [ ] Supabase SQL が実行済みで `button_counter` に `id = 1` の行がある
- [ ] ボタン押下でカウンターが増える（RPC `increment_counter` が 200 を返す）
- [ ] iPhone Safari でボタン音が鳴る
- [ ] Milestone Card が想定どおり表示される
- [ ] Save Image / Web Share が動作する
- [ ] OGP（title / description / url / siteName）が意図どおり
- [ ] PWA manifest・favicon・アイコンが表示される
- [ ] `NEXT_PUBLIC_GA_ID` を使う場合、GA イベントが記録される
- [ ] `npm run lint` と `npm run build` が通る

## 開発用ツール

### Milestone 判定一覧

ブラウザコンソールで:

```javascript
window.PapipuMilestoneDebug.printTable()
```

### 音声切り分けページ

`/sound-test.html` — React/Next を通さず HTML Audio のみで再生確認するページ。iPhone Safari の音声デバッグ用。**本番 UI からはリンクしていません。** 公開後も残しておくことを推奨します（トラブル時の切り分けに有用）。

## ディレクトリ概要

```
public/
  icons/icon.svg       # favicon / PWA アイコン
  papipu-audio.js      # 音声再生（変更注意）
  papipu-button.js     # ボタン UI アニメーション
  papipu-counter.js    # Supabase カウンター
  papipu-milestone.js  # Milestone Card
  papipu-analytics.js  # GA4 イベント helper
src/app/
  layout.tsx           # OGP / PWA / スクリプト読み込み
  manifest.ts          # Web App Manifest
  components/PapipuApp.tsx
```

## License

Private project — Project PapipupePopcorn
