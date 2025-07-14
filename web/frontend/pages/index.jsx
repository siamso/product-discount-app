import { Card, Page, Layout, Image, Text, Button } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <Page narrowWidth>
      <TitleBar title={t("HomePage.title")} />
      <Layout>
        <Layout.Section>
          <Link to="/discount">
            <Button>Create Discount</Button>
          </Link>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
