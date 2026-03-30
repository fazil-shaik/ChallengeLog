import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface ChangeOrderDiscussEmailProps {
  designerName: string;
  clientName: string;
  projectName: string;
  orderLink: string;
}

export const ChangeOrderDiscussEmail = ({
  designerName = "Designer",
  clientName = "Client",
  projectName = "Your Project",
  orderLink = "#",
}: ChangeOrderDiscussEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Discussion Requested: {projectName}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border-4 border-black border-solid rounded my-[40px] mx-auto p-[20px] max-w-[465px] bg-white shadow-[8px_8px_0px_#000]">
            <Section className="mt-[32px]">
              <Text className="text-black text-[24px] font-bold text-center p-0 my-[30px] mx-0 uppercase tracking-widest border-b-[3px] border-[#f5b887] pb-4">
                Discussion Requested
              </Text>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {designerName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>{clientName}</strong> has requested to discuss the pending change order for <strong>{projectName}</strong> before approving it.
            </Text>

            <Text className="text-black text-[14px] leading-[24px] mt-4">
              Please reach out to the client to answer any questions or clarify the scope. The status remains &apos;pending&apos;.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <a
                href={orderLink}
                className="bg-[#f5b887] rounded text-black text-[12px] font-bold uppercase tracking-widest no-underline text-center px-5 py-3 border-2 border-black shadow-[4px_4px_0px_#000] inline-block"
              >
                View Order Details
              </a>
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Notification generated via Challengelog.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ChangeOrderDiscussEmail;
