import { SettingsSubpageShell } from '@/components/settings/settings-subpage-shell';

export default function PrivacyPolicyPage() {
  return (
    <SettingsSubpageShell title="プライバシーポリシー">
      <article className="space-y-5 text-sm font-sans text-foreground leading-relaxed">
        <p className="text-muted-foreground text-xs">
          最終更新日: 2026年4月1日
        </p>
        <section className="space-y-2">
          <h2 className="text-base font-medium text-foreground">1. はじめに</h2>
          <p className="text-muted-foreground">
            本プライバシーポリシーは、思い出帳（以下「本サービス」）における利用者の個人情報等の取り扱いについて定めるものです。
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-medium text-foreground">
            2. 取得する情報
          </h2>
          <p className="text-muted-foreground">
            本サービスは、アカウント登録・認証に伴い、メールアドレス、表示名、プロフィール画像等を取得する場合があります。また、利用者がアップロードした写真・動画・メモ等のコンテンツがサーバー上に保存されます。
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-medium text-foreground">3. 利用目的</h2>
          <p className="text-muted-foreground">
            取得した情報は、本サービスの提供・運営、本人確認、お問い合わせ対応、不正利用の防止、法令に基づく対応のために利用します。
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-medium text-foreground">
            4. 第三者提供・委託
          </h2>
          <p className="text-muted-foreground">
            法令に基づく場合を除き、本人の同意なく第三者に個人情報を提供しません。本サービスのホスティング等に必要な範囲で、クラウド事業者等に業務を委託する場合があります。
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-medium text-foreground">5. 安全管理</h2>
          <p className="text-muted-foreground">
            適切なセキュリティ対策を講じ、取得した情報の漏えい、滅失、毀損の防止に努めます。
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-medium text-foreground">
            6. お問い合わせ
          </h2>
          <p className="text-muted-foreground">
            本ポリシーに関するお問い合わせは、本サービス内のお問い合わせ窓口（設置している場合）または運営者が指定する連絡先までご連絡ください。
          </p>
        </section>
      </article>
    </SettingsSubpageShell>
  );
}
