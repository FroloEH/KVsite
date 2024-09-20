export interface FooterLink {
  link_text: string
  link_target: string
}

export interface FooterContent {
  footer_1st_column_links: FooterLink[]
  footer_2nd_column_links: FooterLink[]
  footer_3rd_column_links: FooterLink[]
  footer_1st_column_header: string
  footer_2nd_column_header: string
  footer_3rd_column_header: string
  footer_3rd_column_subheader: string
  footer_cta_text: string
  footer_cta_link: string
  footer_cta_button_text: string
}
