INSERT INTO "Section" ("heading", "assignedRubricId")
SELECT section_heading.heading, rubric.id
FROM "Rubric" AS rubric
CROSS JOIN (
    VALUES
        ('Introduction'),
        ('Materials and Sourcing'),
        ('Methodology and Reproducibility'),
        ('Replication, risk of bias and Statistics'),
        ('Reporting and Transparency')
) AS section_heading(heading)
WHERE NOT EXISTS (
    SELECT 1
    FROM "Section" AS existing_section
    WHERE existing_section."assignedRubricId" = rubric.id
      AND existing_section.heading = section_heading.heading
);
