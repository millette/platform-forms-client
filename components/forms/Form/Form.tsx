import React, { useEffect } from "react";
import { withFormik, FormikProps } from "formik";
import getConfig from "next/config";
import { getFormInitialValues } from "../../../lib/formBuilder";
import { validateOnSubmit, getErrorList, setFocusOnErrorMessage } from "../../../lib/validation";
import { submitToAPI } from "../../../lib/dataLayer";
import { Button, Alert } from "../index";
import { logMessage } from "../../../lib/logger";
import { FormValues, InnerFormProps, DynamicFormProps, Responses } from "../../../lib/types";

/**
 * This is the "inner" form component that isn't connected to Formik and just renders a simple form
 * @param props
 */
const {
  publicRuntimeConfig: { isProduction: isProduction },
} = getConfig();
const InnerForm = (props: InnerFormProps & FormikProps<FormValues>) => {
  const { children, handleSubmit, t } = props;

  const errorList = props.errors ? getErrorList(props) : null;
  const errorId = "gc-form-errors";
  const serverErrorId = `${errorId}-server`;
  const formStatusError = props.status === "Error" ? t("server-error") : null;

  //  If there are errors on the page, set focus the first error field
  useEffect(() => {
    if (formStatusError) {
      setFocusOnErrorMessage(props, serverErrorId);
    }
    if (!props.isValid && props.submitCount > 0) {
      setFocusOnErrorMessage(props, errorId);
    }
  }, [props.submitCount, props.isValid, props.errors]);

  return (
    <>
      {formStatusError ? (
        <Alert type="error" heading={formStatusError} tabIndex={0} id={serverErrorId} />
      ) : null}
      {errorList ? (
        <Alert
          type="error"
          heading={t("input-validation.heading")}
          validation={true}
          id={errorId}
          tabIndex={0}
        >
          {errorList}
        </Alert>
      ) : null}

      <form
        id="form"
        data-testid="form"
        onSubmit={handleSubmit}
        method="POST"
        encType="multipart/form-data"
        noValidate
      >
        {children}
        <div className="buttons">
          <Button className="gc-button" type="submit">
            {t("submitButton")}
          </Button>
        </div>
      </form>
    </>
  );
};

/**
 * This is the main Form component that wraps "InnerForm" withFormik hook, giving all of its components context
 * @param props
 */
export const Form = withFormik<DynamicFormProps, FormValues>({
  validateOnChange: false,

  validateOnBlur: false,

  enableReinitialize: true, // needed when switching languages

  mapPropsToValues: (props) => {
    return getFormInitialValues(props.formMetadata, props.language) as FormValues;
  },

  validate: (values, props) => {
    const validationResult = validateOnSubmit(values, props);
    return validationResult;
  },

  handleSubmit: async (values, formikBag) => {
    try {
      await submitToAPI(values as Responses, formikBag, isProduction);
    } catch (err) {
      logMessage.error(err);
    } finally {
      formikBag.setSubmitting(false);
    }
  },
})(InnerForm);

export default Form;
