import React, { useState } from "react";
import { Button, VStack } from "@chakra-ui/react";

import ScholarshipCard from "./ScholarshipCard";

const ScholarshipList = ({
  scholarships,
  onSaveScholarship,
  onSend,
  onDelete,
  isAdminMode,
  onUpdate,
  viewMode = "all",
  itemsPerPage = 10, // how many items to show per page
  removeFromSaved = { removeFromSaved },
  secretMode = false,
}) => {
  const [visibleCount, setVisibleCount] = useState(10);

  // The subset of scholarships currently shown
  const visibleScholarships = scholarships.slice(0, visibleCount);

  // If we've shown everything, hide the "Load More" button
  const hasMore = visibleCount < scholarships.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  return (
    <VStack spacing={4} mt={12}>
      {visibleScholarships.map((scholarship, index) => (
        <ScholarshipCard
          // key={index}
          key={scholarship.id || "x"}
          scholarship={scholarship}
          onSaveScholarship={onSaveScholarship}
          onSend={onSend}
          onDelete={onDelete}
          isAdminMode={isAdminMode}
          onUpdate={onUpdate}
          viewMode={viewMode}
          removeFromSaved={removeFromSaved}
          secretMode={secretMode}
        />
      ))}

      {hasMore && (
        <Button onClick={handleLoadMore} alignSelf="center">
          Load More
        </Button>
      )}
    </VStack>
  );
};

export default ScholarshipList;
