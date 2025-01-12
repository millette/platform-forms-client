describe("CDS Platform Intake Form functionality", { baseUrl: "http://localhost:3000" }, () => {
  let formMetaData = null;
  before(() => {
    //Get form JSON configuration
    cy.readFile("forms/platform_intake.json").then((response) => {
      formMetaData = response;
    });
  });

  it("CDS Platform Intake Form renders", () => {
    cy.visit(`/en/id/${formMetaData.form.id}`);
    cy.get("h1").contains(formMetaData.form.titleEn);
  });
  it("Fill out the form", () => {
    cy.get("input[id='2']").type("Santa Claus").should("have.value", "Santa Claus");
    cy.get("input[id='3']")
      .type("santaclaus@northpole.global")
      .should("have.value", "santaclaus@northpole.global");
    cy.get("input[id='4']").type("CDS Gifts").should("have.value", "CDS Gifts");
    cy.get("input[id=5]").type("1 877-636-0656").should("have.value", "1 877-636-0656");
    cy.get(".gc-checkbox-label").click({ multiple: true });
    cy.get("input[id='7']")
      .type("Call me at my work number")
      .should("have.value", "Call me at my work number");
  });
  it("Submit the Form", () => {
    cy.get("button").contains("Submit").click();
    cy.url().should("include", `/en/id/${formMetaData.form.id}/confirmation`);
    cy.get("h1").contains("Your submission has been received");
    cy.get("[data-testid='fip']").find("img").should("have.attr", "src", "/img/sig-blk-en.svg");
    cy.get("#content").contains(
      "Thank you, your request has been submitted. A team member will email you shortly."
    );
  });
});
