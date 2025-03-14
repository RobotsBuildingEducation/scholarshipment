import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
  Text,
  Link,
  Box,
  SimpleGrid,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

export const LoanInfoModal = ({ isOpen, onClose }) => {
  const generalLoanResources = [
    {
      title: "Field Specific Grants for Loan Repayment Options",
      link: "https://www.bestcolleges.com/blog/grants-to-pay-off-student-loans/",
    },
    {
      title: "Grants for Loan Repayment",
      link: "https://studentloanhero.com/featured/grants-to-pay-off-student-loans/",
    },
    {
      title: "US Department of Education Repayment Options",
      link: "https://www2.ed.gov/fund/grants-college.html?src=pn",
    },
    {
      title: "Student Loan Deadlines and News",
      link: "https://studentloanhero.com/featured/when-is-end-of-student-loan-pause/",
    },
    {
      title: "Basics of Student Loans",
      link: "https://www.consumerfinance.gov/consumer-tools/student-loans/#getting-a-student-loan",
    },
    {
      title: "FAFSA Application Deadlines by State",
      link: "https://studentaid.gov/apply-for-aid/fafsa/fafsa-deadlines",
    },
    {
      title: "Student Loans Without CoSigner/Credit",
      link: "https://www.funding-u.com/no-cosigner-student-loans",
    },
  ];

  const dacaResources = [
    {
      title: "Loans for DACA Students (No Cosigner)",
      link: "https://www.mpowerfinancing.com/get-a-loan/daca-student-loans?utm_campaign=elle-search-intl-nonbrand-US/CA-RES&utm_source=google&utm_medium=cpc&gclid=Cj0KCQjwl8anBhCFARIsAKbbpyQUMuJPqvxc9vaJlWMUiag8AW3h04etysZ-tuGWp-Q2XyzaX7rQjK8aAgBlEALw_wcB",
    },
    {
      title: "Loans for Immigrants",
      link: "https://www.stilt.com/",
    },
    {
      title: "Loans for International Students (No Cosigner or Collateral)",
      link: "https://prodigyfinance.com/",
    },
    {
      title: "Loans for International Students (No Cosigner or Collateral)",
      link: "https://www.mpowerfinancing.com/get-a-loan?utm_source=lendedu&utm_medium=link&utm_campaign=partnerlink&utm_content=20220722--borrower",
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
      <ModalOverlay />
      <ModalContent borderRadius="lg" overflow="hidden">
        <ModalHeader bg="whiteAlpha.500" color="black">
          Student Loan Resources
        </ModalHeader>
        <ModalCloseButton color="black" />
        <ModalBody>
          <Text fontSize="lg" fontWeight="bold" mb={3}>
            Student Loans Info
          </Text>
          <SimpleGrid columns={2} spacing={4} mb={6}>
            {generalLoanResources.map((resource, idx) => (
              <Box key={idx} p={4} borderWidth="1px" borderRadius="md">
                <Text fontWeight="medium" mb={1}>
                  {resource.title}
                </Text>
                <Link
                  href={resource.link}
                  isExternal
                  color="blue.500"
                  fontWeight="semibold"
                >
                  Visit Link <ExternalLinkIcon mx="2px" />
                </Link>
              </Box>
            ))}
          </SimpleGrid>

          <Divider my={4} />

          <Text fontSize="lg" fontWeight="bold" mb={3}>
            For DACA/Immigrants/International Students
          </Text>
          <SimpleGrid columns={2} spacing={4}>
            {dacaResources.map((resource, idx) => (
              <Box key={idx} p={4} borderWidth="1px" borderRadius="md">
                <Text fontWeight="medium" mb={1}>
                  {resource.title}
                </Text>
                <Link
                  href={resource.link}
                  isExternal
                  color="blue.500"
                  fontWeight="semibold"
                >
                  Visit Link <ExternalLinkIcon mx="2px" />
                </Link>
              </Box>
            ))}
          </SimpleGrid>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
