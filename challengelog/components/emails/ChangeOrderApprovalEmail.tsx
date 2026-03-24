import {
  Body,
  Button,
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

interface ChangeOrderApprovalEmailProps {
  designerName: string;
  clientName: string;
  projectName: string;
  changeDescription: string;
  cost: string;
  approvalLink: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const ChangeOrderApprovalEmail = ({
  designerName = "Your Designer",
  clientName = "Client",
  projectName = "Your Project",
  changeDescription = "A new change request has been estimated.",
  cost = "0.00",
  approvalLink = "http://localhost:3000/orders/approve",
}: ChangeOrderApprovalEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Approval Required: New Change Order for {projectName}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border-4 border-black border-solid rounded my-[40px] mx-auto p-[20px] max-w-[465px] bg-white shadow-[8px_8px_0px_#000]">
            <Section className="mt-[32px]">
              <Text className="text-black text-[24px] font-bold text-center p-0 my-[30px] mx-0 uppercase tracking-widest border-b-[3px] border-black pb-4">
                Change Order
              </Text>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {clientName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>{designerName}</strong> has prepared a new change order for your project <strong>{projectName}</strong>. Please review the details below.
            </Text>

            <Section className="bg-[#f0f0f0] border-2 border-black p-4 my-6 shadow-[4px_4px_0px_#000]">
              <Text className="text-black text-[12px] font-bold uppercase tracking-widest mt-0 mb-2">
                Scope Description
              </Text>
              <Text className="text-black text-[14px] italic mt-0">
                "{changeDescription}"
              </Text>

              <Hr className="border border-black my-4" />

              <Text className="text-black text-[12px] font-bold uppercase tracking-widest mt-0 mb-2">
                Estimated Cost
              </Text>
              <Text className="text-black text-[24px] font-bold font-mono mt-0">
                ${cost}
              </Text>
            </Section>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#9b87f5] rounded text-white text-[12px] font-bold uppercase tracking-widest no-underline text-center px-5 py-3 border-2 border-black shadow-[4px_4px_0px_#000]"
                href={approvalLink}
              >
                Review & Approve
              </Button>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
              If you have any questions or would like to discuss this further, please reach out to {designerName} or reply to this email.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This request was generated via Challengelog.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ChangeOrderApprovalEmail;
