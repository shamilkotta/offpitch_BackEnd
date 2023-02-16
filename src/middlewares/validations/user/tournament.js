import * as yup from "yup";
import ErrorResponse from "../../../error/ErrorResponse.js";

const stepOneSchema = yup.object().shape({
  cover: yup
    .string()
    .typeError("Cover image can not be empty")
    // .trim()
    .url("Cover image can not be empty")
    .required("Cover image can not be empty"),
  title: yup
    .string()
    .trim()
    .required("Title can not be empty")
    .min(100, "Too short title")
    .max(200, "Too long title, maximum of 200 characters"),
  short_description: yup
    .string()
    .trim()
    .required("Description can not be empty")
    .min(300, "Too short description")
    .max(400, "Too long description, maximum of 400 characters"),
  start_date: yup
    .date()
    .typeError("Please add valid starting date")
    .min(new Date(), "Enter a valid starting date")
    .required("Starting date can not be empty"),
  location: yup.string().trim().required("Location can not be empty"),
  description: yup
    .string()
    .trim()
    .required("About section can not be empty")
    .min(500, "Too short about")
    .max(1000, "Too long description"),
});

const stepTwoSchema = yup.object().shape({
  instruction: yup
    .string()
    .trim()
    .required("Instructions can not be empty")
    .min(500, "Too short Instruction")
    .max(1000, "Too long Instruction"),
  no_teams: yup
    .number("Enter no of teams that can be registerd")
    .typeError("Enter no of teams that can be registerd")
    .required("No of teams can not be empty")
    .min(4, "Atleast 4 teams needed")
    .max(64, "Can only register upto 64 teams max"),
  max_no_players: yup
    .number("Enter valid no of players")
    .typeError("Enter valid no of palyers")
    .required("No of players can not be empty")
    .min(3, "3-a-side the minimum match")
    .max(18, "Allowed only max upto 18 players"),
  registration_fee: yup
    .object()
    .shape({
      is: yup
        .boolean("Choose valid registration option")
        .typeError("Choose valid registration option")
        .required("Choose valid registration option")
        .default(false),
      amount: yup
        .number("Enter a valid registration amount")
        .typeError("Enter a valid registration amount")
        .when("is", {
          is: true,
          then: (schema) =>
            schema
              .required("Enter a valid registration amount")
              .min(1, "Enter a valid registration amount"),
        }),
    })
    .typeError("Choose a valid registraion type"),
});

const stepThreeSchema = yup.object().shape({
  tickets: yup
    .object()
    .shape({
      matchday_ticket: yup
        .object()
        .shape({
          is: yup
            .boolean("choose a valid ticket option")
            .typeError("Choose valid ticket option"),
          amount: yup
            .number("Enter a valid ticket amount")
            .typeError("Enter a valid ticket amount")
            .when("is", {
              is: true,
              then: (schema) =>
                schema
                  .required("Enter a valid ticket amount")
                  .min(1, "Enter a valid ticket amount"),
            }),
        })
        .typeError("Choose a valid ticket type"),
      season_ticket: yup
        .object()
        .shape({
          is: yup
            .boolean("choose a valid ticket option")
            .typeError("Choose valid ticket option"),
          amount: yup
            .number("Enter a valid ticket amount")
            .typeError("Enter a valid ticket amount")
            .when("is", {
              is: true,
              then: (schema) =>
                schema
                  .required("Enter a valid ticket amount")
                  .min(1, "Enter a valid ticket amount"),
            }),
        })
        .typeError("Choose a valid ticket type"),
    })
    .typeError("Choose a valid ticket type"),
});

const stepFourSchema = yup.object().shape({
  tournament_type: yup
    .string()
    .oneOf(["t1", "t2", "t3", "t4"], "Choose valid tournament type")
    .required("Choose valid tournament type"),
});

const currentSchema = (step = 0) => {
  switch (step) {
    case 1:
      return stepOneSchema;
    case 2:
      return stepTwoSchema;
    case 3:
      return stepThreeSchema;
    default:
      return yup.object().shape({
        ...stepOneSchema.fields,
        ...stepTwoSchema.fields,
        ...stepThreeSchema.fields,
        ...stepFourSchema.fields,
      });
  }
};

const tournamentValidation = (req, res, next) => {
  const formData = req.body;
  formData.cover = req.body.imageData;
  const schema = currentSchema(formData?.step);

  schema
    .validate(formData, { stripUnknown: true, abortEarly: false })
    .then((data) => {
      req.validData = data;
      req.validData.status = formData.step > 3 ? "active" : "draft";
      next();
    })
    .catch((err) => {
      const [validationErr] = err.errors;
      next(ErrorResponse.badRequest(validationErr));
    });
};

export default tournamentValidation;