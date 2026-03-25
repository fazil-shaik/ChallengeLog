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

interface ChangeOrderApprovedEmailProps {
  designerName: string;
  clientName: string;
  projectName: string;
  cost: string;
  orderLink: string;
}

export const ChangeOrderApprovedEmail = ({
  designerName = "Designer",
  clientName = "Client",
  projectName = "Your Project",
  cost = "0.00",
  orderLink = "http://localhost:3000/dashboard",
}: ChangeOrderApprovedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Change Order Approved: {projectName}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border-4 border-black border-solid rounded my-[40px] mx-auto p-[20px] max-w-[465px] bg-white shadow-[8px_8px_0px_#000]">
            <Section className="mt-[32px]">
              <Text className="text-black text-[24px] font-bold text-center p-0 my-[30px] mx-0 uppercase tracking-widest border-b-[3px] border-[#9b87f5] pb-4">
                Approved!
              </Text>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {designerName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Great news! <strong>{clientName}</strong> has just approved the change order for <strong>{projectName}</strong>.
            </Text>

            <Section className="bg-[#f0f0f0] border-2 border-black p-4 my-6 shadow-[4px_4px_0px_#000]">
              <Text className="text-black text-[12px] font-bold uppercase tracking-widest mt-0 mb-2">
                Approved Amount
              </Text>
              <Text className="text-black text-[24px] font-bold font-mono mt-0 text-[#10b981]">
                +${cost}
              </Text>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
              The status has been updated in your dashboard. You can now proceed with the requested changes.
            </Text>
            
            <Section className="text-center mt-[32px] mb-[32px]">
              <a
                href={orderLink}
                className="bg-[#9b87f5] rounded text-white text-[12px] font-bold uppercase tracking-widest no-underline text-center px-5 py-3 border-2 border-black shadow-[4px_4px_0px_#000] inline-block"
              >
                View Dashboard
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

export default ChangeOrderApprovedEmail;
