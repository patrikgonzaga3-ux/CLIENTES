<?php
/**
 * Snippet "Claude · gravar Elementor por API" (colar no plugin Code Snippets do WordPress da Michele).
 *
 * Cria UMA rota na API do WordPress: POST /wp-json/claude/v1/elementor/{id da página}
 * Ela grava o layout do Elementor (o JSON) numa página que já existe.
 * Só funciona para quem está logado com permissão de editar aquela página
 * (no nosso caso, a senha de aplicação do usuário michelesalla).
 * Não mexe em mais nada do site. Para desligar, basta desativar o snippet.
 */
add_action( 'rest_api_init', function () {
	register_rest_route( 'claude/v1', '/elementor/(?P<id>\d+)', array(
		'methods'             => 'POST',
		'permission_callback' => function ( $request ) {
			return current_user_can( 'edit_post', (int) $request['id'] );
		},
		'callback'            => function ( $request ) {
			$id   = (int) $request['id'];
			$data = $request->get_param( 'data' );
			if ( ! get_post( $id ) ) {
				return new WP_Error( 'sem_pagina', 'Página não encontrada.', array( 'status' => 404 ) );
			}
			if ( ! is_string( $data ) || null === json_decode( $data ) ) {
				return new WP_Error( 'json', 'O campo data precisa ser o JSON do Elementor.', array( 'status' => 400 ) );
			}
			update_post_meta( $id, '_elementor_data', wp_slash( $data ) );
			update_post_meta( $id, '_elementor_edit_mode', 'builder' );
			update_post_meta( $id, '_elementor_template_type', 'wp-page' );
			if ( defined( 'ELEMENTOR_VERSION' ) ) {
				update_post_meta( $id, '_elementor_version', ELEMENTOR_VERSION );
			}
			$page_settings = $request->get_param( 'page_settings' );
			if ( is_array( $page_settings ) ) {
				update_post_meta( $id, '_elementor_page_settings', $page_settings );
			}
			// Recria só o CSS desta página (não mexe no cache do resto do site).
			delete_post_meta( $id, '_elementor_css' );
			delete_post_meta( $id, '_elementor_element_cache' );
			if ( class_exists( '\Elementor\Core\Files\CSS\Post' ) ) {
				\Elementor\Core\Files\CSS\Post::create( $id )->update();
			}
			return array(
				'ok'      => true,
				'id'      => $id,
				'editar'  => admin_url( 'post.php?post=' . $id . '&action=elementor' ),
				'previa'  => get_preview_post_link( $id ),
			);
		},
	) );
} );
