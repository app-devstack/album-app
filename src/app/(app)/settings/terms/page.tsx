import { SettingsSubpageShell } from '@/components/settings/settings-subpage-shell';

export default function TermsPage() {
  return (
    <SettingsSubpageShell title="利用規約">
      <article className="space-y-5 text-sm font-sans text-foreground leading-relaxed">
        <p className="text-muted-foreground text-xs">
          最終更新日: 2026年4月1日
        </p>
        <section className="space-y-2">
          <h2 className="text-base font-medium text-foreground">
            第1条（適用）
          </h2>
          <p className="text-muted-foreground">
            本規約は、思い出帳（以下「本サービス」）の利用に関する条件を、本サービスを利用するすべての利用者と運営者との間で定めるものです。
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-medium text-foreground">
            第2条（利用登録）
          </h2>
          <p className="text-muted-foreground">
            利用者は、運営者の定める方法により登録申請を行い、運営者がこれを承認することによって、利用登録が完了するものとします。
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-medium text-foreground">
            第3条（禁止事項）
          </h2>
          <p className="text-muted-foreground">
            利用者は、法令または公序良俗に違反する行為、他者の権利を侵害する行為、本サービスの運営を妨害する行為、その他運営者が不適切と判断する行為をしてはなりません。
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-medium text-foreground">
            第4条（コンテンツの取り扱い）
          </h2>
          <p className="text-muted-foreground">
            利用者が本サービスにアップロードしたコンテンツに関する権利は利用者に帰属します。利用者は、本サービスの提供に必要な範囲で、運営者に対し、当該コンテンツの利用を許諾するものとします。
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-medium text-foreground">
            第5条（免責）
          </h2>
          <p className="text-muted-foreground">
            運営者は、本サービスに事実上または法律上の瑕疵がないことを保証するものではありません。運営者は、本サービスに起因して利用者に生じた損害について、運営者に故意または重過失がある場合を除き、責任を負いません。
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-medium text-foreground">
            第6条（規約の変更）
          </h2>
          <p className="text-muted-foreground">
            運営者は、必要と判断した場合、利用者への通知なく本規約を変更できるものとします。変更後の規約は、本サービス上に掲示した時点から効力を生じます。
          </p>
        </section>
      </article>
    </SettingsSubpageShell>
  );
}
