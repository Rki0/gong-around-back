// reference
// https://dev.to/kwabenberko/extend-express-s-request-object-with-typescript-declaration-merging-1nn5
// https://stackoverflow.com/questions/57132428/augmentations-for-the-global-scope-can-only-be-directly-nested-in-external-modul
// https://velog.io/@sinf/error-TS2339-Property-user-does-not-exist-on-type-Reqeust

export {};

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }

    namespace Multer {
      interface File {
        ext?: string;
      }
    }
  }
}
