import { FormulasPage } from './app.po';

describe('formulas App', () => {
  let page: FormulasPage;

  beforeEach(() => {
    page = new FormulasPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
